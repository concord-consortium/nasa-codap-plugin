import React, { useEffect, useState, useRef, useCallback } from "react";
import { clsx } from "clsx";
import { ICurrentDayLocation, ILocation } from "../types";
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
      console.warn("Selection result was not successful", selectionResult);
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

  const currentDayLocationRef = useRef<ICurrentDayLocation>({
    _latitude: "",
    _longitude: "",
    _dayOfYear: 171
  });

  const { getUniqueLocationsInCodapData } = useCodapData();
  const getUniqueLocationsRef = useRef(getUniqueLocationsInCodapData);

  const handleDayUpdateInTheSimTab = (day: number) => {
    currentDayLocationRef.current._dayOfYear = day;
    debouncedUpdateRowSelectionInCodap(
      currentDayLocationRef.current._latitude,
      currentDayLocationRef.current._longitude,
      day
    );
  };

  const handleCaseSelectionInCodap = useCallback((
    selectedLatitude: string,
    selectedLongitude: string,
    selectedDay: number
  ) => {
    const { _latitude, _longitude, _dayOfYear } = currentDayLocationRef.current;
    const rowInLocation = `${_latitude},${_longitude}` === `${selectedLatitude},${selectedLongitude}`;
    const newDayChoice = `${_dayOfYear}` !== `${selectedDay}`;
    if (rowInLocation && newDayChoice) {
      setDayOfYear(selectedDay);
      currentDayLocationRef.current._dayOfYear = selectedDay;
    }
  }, []);

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
    };

    initialize();
  }, []);

  const handleDataContextChange = useCallback(async (listenerRes: ClientNotification) => {
    console.log("| dataContextChangeNotice: ", listenerRes);
    const { resource, values } = listenerRes;
    const isResource = resource === `dataContextChangeNotice[${kDataContextName}]`;
    if (!isResource || !values.result.success) return;

    const casesDeleted = values.operation === "selectCases" && values.result.cases.length === 0
    const caseSelected = values.operation === "selectCases" && values.result.cases.length === 1;

    //TODO: there is an unhandled path when we edit the location name
    // we can use this to update the location name in the UI

    if (casesDeleted) {
      const uniqueLocations = await getUniqueLocationsRef.current();
      if (uniqueLocations) setLocations(uniqueLocations);
    }
    else if (caseSelected) {
      const parentCaseId = values.result.cases[0].parent;
      const selectedDay = values.result.cases[0].values.dayOfYear;
      const parentCase = await getCaseByID(kDataContextName, parentCaseId);
      const selectedLatitude = parentCase.values.case.values.latitude;
      const selectedLongitude = parentCase.values.case.values.longitude;
      handleCaseSelectionInCodap(
        selectedLatitude,
        selectedLongitude,
        selectedDay
      );
    }
  }, [handleCaseSelectionInCodap]);

  useEffect(() => {
    addDataContextChangeListener(kDataContextName, handleDataContextChange);
  }, [handleDataContextChange]);

  useEffect(() => {
    currentDayLocationRef.current = {
      _latitude: latitude,
      _longitude: longitude,
      _dayOfYear: dayOfYear
    };
  }, [latitude, longitude, dayOfYear]);

  const handleTabClick = (tab: "location" | "simulation") => {
    setActiveTab(tab);
    codapInterface.sendRequest({
      action: "update",
      resource: "interactiveFrame",
      values: {
        dimensions: tab === "location" ? kInitialDimensions : kSimulationTabDimensions
      }
    }).then(() => {
      // This brings the plugin window to the front within CODAP
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
