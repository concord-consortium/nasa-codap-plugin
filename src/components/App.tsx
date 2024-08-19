import React, { useEffect, useState, useRef } from "react";
import { clsx } from "clsx";
import { ILocation } from "../types";
import { debounce } from "../grasp-seasons/utils/utils";
import { kInitialDimensions, kVersion, kPluginName, kDefaultOnAttributes, kSimulationTabDimensions, kDataContextName, kChildCollectionName } from "../constants";
import { initializePlugin, codapInterface, selectSelf, addDataContextChangeListener, ClientNotification, getCaseByID } from "@concord-consortium/codap-plugin-api";
import { useCodapData } from "../hooks/useCodapData";
import { LocationTab } from "./location-tab";
import { SimulationTab } from "./simulation-tab";
import { Header } from "./header";

import "../assets/scss/App.scss";

const debouncedUpdateRowSelectionInCodap = debounce((
  latitude: string,
  longitude: string,
  day: number
) => {
  console.log(`\n| Selecting case in ${kDataContextName} where latitude: ${latitude}, longitude: ${longitude}, day: ${day}`);
  // TODO: It seems roundabout to look up the case id and then go back to ask for it
  // But I was unable to find an example of how to select a case by its attribute values
  // Next thing for this might be to see if the case ids might be mapped somewhere to the dayOfYear
  // It could be a more direct way to select the case rather than two api requests
  // TODO: I could not get a single chain of conditions working with this syntax.
  // So The way I did this for now was to add a hidden field `identity` in CODAP with a formula that concatenates latidude, longitude, and dayOfYear
  // This is only partially working, there is something not working with the saved location
  // You can find a place, change location, and get the right record
  // But if you switch back to the original location, it does not find the record
  // and then search for that
  // alternative: find a plugin that finds existing cases by attribute values and see how its done
  // alternative: to use a dataContext object?
  // alternative: three requests, one for each attribute equality condition, and then Promise.all them and then find common items
  codapInterface.sendRequest({
    action: "get",
    resource: `dataContext[${kDataContextName}].collection[${kChildCollectionName}].caseSearch[calcId==${latitude},${longitude},${Math.floor(day)}]`
  }).then((result: any) => {
    if (result.success && result.values.length > 0) {
      const caseID = result.values[0].id;
      return codapInterface.sendRequest({
        action: "create",
        resource: `dataContext[${kDataContextName}].selectionList`,
        values: [caseID]
      });
    } else {
      return null;
    }
  }).then((selectionResult: any) => {
    if (!selectionResult.success) {
      console.warn("Selection result was not sucessful", selectionResult);
    }
  }).catch((error: any) => {
    console.error("Error in selection process:", error);
  });
}, 250);

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"location" | "simulation">("location");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [dayOfYear, setDayOfYear] = useState(171);
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [selectedAttrs, setSelectedAttributes] = useState<string[]>(kDefaultOnAttributes);
  const [dataContext, setDataContext] = useState<any>(null);

  // Store a ref to getUniqueLocationsInCodapData so we can call inside useEffect without triggering unnecessary re-runs
  const { getUniqueLocationsInCodapData } = useCodapData();
  const getUniqueLocationsRef = useRef(getUniqueLocationsInCodapData);

  const handleDayUpdateInTheSimTab = (day: number) => {
    debouncedUpdateRowSelectionInCodap(latitude, longitude, day);
  };

  const handleCaseSelectionInCodap = (
    selectedLatitude: string,
    selectedLongitude: string,
    selectedDay: number,
    currentLatitude: string,
    currentLongitude: string,
    currentDayOfYear: number
  ) => {
    const rowInLocation = `${currentLatitude},${currentLongitude}` === `${selectedLatitude},${selectedLongitude}`;
    const newDayChoice = `${currentDayOfYear}` !== `${selectedDay}`;
    if (rowInLocation && newDayChoice) {
      setDayOfYear(selectedDay);
      // TODO: this works, but CODAP v2 it is also resetting the case table so we scroll away from selected row
      // Perhaps because it is re-rendering the table with the new case selected?
    }
  };

  useEffect(() => {
    const initialize = async () => {
      console.log("| !! Initializing plugin");
      try {
        await initializePlugin({
          pluginName: kPluginName,
          version: kVersion,
          dimensions: kInitialDimensions
        });
      } catch (e) {
        console.error("Failed to initialize plugin, error:", e);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    const handleDataContextChange = async (listenerRes: ClientNotification) => {
      console.log("| dataContextChangeNotice: ", listenerRes);
      // TODO: as per discussion with team, it might be more typical
      // to use the notificaiton as catalyst to ask for state we interested in from CODAP
      // rather than try to parse the notification for the data we need

      const { resource, values } = listenerRes;
      const isResource = resource === `dataContextChangeNotice[${kDataContextName}]`;
      if (!isResource || !values.result.success) return;

      const casesDeleted = values.operation === "selectCases" && values.result.cases.length === 0
      const caseSelected = values.operation === "selectCases" && values.result.cases.length === 1;

      // If cases were deleted, we should update the locations list
      if (casesDeleted) {
        const uniqeLocations = await getUniqueLocationsRef.current();
        if (uniqeLocations) setLocations(uniqeLocations);
      }
      // If a case was selected, we should update the dayOfYear
      else if (caseSelected) {
        const parentCaseId = values.result.cases[0].parent;
        const selectedDay = values.result.cases[0].values.dayOfYear;
        const parentCase = await getCaseByID(kDataContextName, parentCaseId);
        const selectedLatitude = parentCase.values.case.values.latitude;
        const selectedLongitude = parentCase.values.case.values.longitude;
        handleCaseSelectionInCodap(
          selectedLatitude,
          selectedLongitude,
          selectedDay,
          latitude,
          longitude,
          dayOfYear
        );
      }
    };
    addDataContextChangeListener(kDataContextName, handleDataContextChange);
  }, [latitude, longitude, dayOfYear]);

  const handleTabClick = (tab: "location" | "simulation") => {
    setActiveTab(tab);
    // Update dimensions of the plugin window when switching tabs.
    codapInterface.sendRequest({
      action: "update",
      resource: "interactiveFrame",
      values: {
        dimensions: tab === "location" ? kInitialDimensions : kSimulationTabDimensions
      }
    }).then(() => {
      // After updating dimensions, call selectSelf to bring the plugin to the front
      selectSelf();
    }).catch((error) => {
      console.error("Error updating dimensions or selecting self:", error);
    });
  };

  return (
    <div className="App">
      <Header
        activeTab={activeTab}
        onTabClick={handleTabClick}
      />
      <div className={clsx("tab-content", { active: activeTab === "location" })}>
        <LocationTab
          latitude={latitude}
          longitude={longitude}
          locationSearch={locationSearch}
          selectedAttrs={selectedAttrs}
          dataContext={dataContext}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
          setLocationSearch={setLocationSearch}
          setSelectedAttributes={setSelectedAttributes}
          setDataContext={setDataContext}
          locations={locations}
          setLocations={setLocations}
        />
      </div>
      <div className={clsx("tab-content", { active: activeTab === "simulation" })}>
        <SimulationTab
          locations={locations}
          latitude={latitude}
          longitude={longitude}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
          setLocationSearch={setLocationSearch}
          dayOfYear={dayOfYear}
          setDayOfYear={handleDayUpdateInTheSimTab}
        />
      </div>
    </div>
  );
};
