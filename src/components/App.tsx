import React, { useEffect, useState, useRef } from "react";
import { clsx } from "clsx";
import { ILocation } from "../types";
import { debounce } from "../grasp-seasons/utils/utils";
import { kInitialDimensions, kVersion, kPluginName, kDefaultOnAttributes, kSimulationTabDimensions, kDataContextName } from "../constants";
import { initializePlugin, codapInterface, selectSelf, addDataContextChangeListener, ClientNotification, getCaseByID } from "@concord-consortium/codap-plugin-api";
import { useCodapData } from "../hooks/useCodapData";
import { LocationTab } from "./location-tab";
import { SimulationTab } from "./simulation-tab";
import { Header } from "./header";

import "../assets/scss/App.scss";

const debouncedUpdateRowSelectionInCodap = debounce((latitude: string, longitude: string, day: number) => {
  console.log("\n| SIM day is: ", day, " so issue API request to update selected row in CODAP ",
    "\n latitude:       ", latitude,
    "\n longitude:      ", longitude,
    "\n day:            ", day,
    "\n Math.floor(day) ", Math.floor(day));

  // Here, you would add the actual API call to update the row selection in CODAP
  // For example:
  // codapInterface.sendRequest({
  //   action: "update",
  //   resource: `dataContext[${kDataContextName}].selectionList`,
  //   values: [{ latitude, longitude, dayOfYear: Math.floor(day) }]
  // });
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

  const handleDayUpdateInTheSimTab = (day: number) => {
    debouncedUpdateRowSelectionInCodap(latitude, longitude, day);
    // NOTE: not need update dayOfYear state variable. It's useful only for the opposite direction
    // it's useful when user select a row in CODAP and we want to update the day in the sim
  };

  const handleCaseSelectionInCodap = (_latitude: string, _longitude: string, day: number) => {
    console.log("| calling handleCaseSelectionInCodap with selected values: ", _latitude, _longitude, day);
    console.log("| matching lat long?: \n    current location: ", latitude, longitude, "\n   selected location: ", _latitude, _longitude);
    console.log("| matching day?: \n    current dayOfYear in sim: ", dayOfYear, "\n  selected day in codap: ", day);
    const correctLocation = latitude === _latitude && longitude === _longitude;
    const isNewDay = dayOfYear !== day;
    if (correctLocation && isNewDay) {
      console.log("| we should update the dayOfYear in the sim tab to day, ", day);
      //setDayOfYear(day);
    }
    // if user actually selected the case from the same location, then update the day of the year.
    // if (latitude === _latitude && longitude === _longitude) {
    //   setDayOfYear(day);
    // }
  }


  // Store a ref to getUniqueLocationsInCodapData so we can call inside useEffect without triggering unnecessary re-runs
  const { getUniqueLocationsInCodapData } = useCodapData();
  const getUniqueLocationsRef = useRef(getUniqueLocationsInCodapData);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializePlugin({
          pluginName: kPluginName,
          version: kVersion,
          dimensions: kInitialDimensions
        });
      } catch (e) {
        console.error("Failed to initialize plugin, error:", e);
      }

      // TODO: make this more general, and then decipher what to do with the data
      const handleDataContextChange = async (listenerRes: ClientNotification) => {
        const { resource, values } = listenerRes;
        const isResource = resource === `dataContextChangeNotice[${kDataContextName}]`;
        if (!isResource || !values.result.success) return;

        // Checking if cases were deleted.  If they were, we need to update the locations list.
        const casesDeleted = values.operation === "selectCases" && values.result.cases.length === 0
        const caseSelected = values.operation === "selectCases" && values.result.cases.length === 1;

        if ( casesDeleted ) {
          const uniqeLocations = await getUniqueLocationsRef.current();
          if (uniqeLocations) setLocations(uniqeLocations);
        } else if (caseSelected) {
          const parentCaseId = values.result.cases[0].parent;
          const selectedDay = values.result.cases[0].values.dayOfYear;
          const parentCase = await getCaseByID(kDataContextName, parentCaseId);
          const selectedLatitude = parentCase.values.case.values.latitude;
          const selectedLongitude = parentCase.values.case.values.longitude;
          handleCaseSelectionInCodap(selectedLatitude, selectedLongitude, selectedDay);
        }
      };
      addDataContextChangeListener(kDataContextName, handleDataContextChange);
    };

    initialize();
  }, []);

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
