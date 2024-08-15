import React, { useEffect, useState, useRef } from "react";
import { clsx } from "clsx";
import { ILocation } from "../types";
import { debounce } from "../grasp-seasons/utils/utils";
import { kInitialDimensions, kVersion, kPluginName, kDefaultOnAttributes, kSimulationTabDimensions, kDataContextName } from "../constants";
import { initializePlugin, codapInterface, selectSelf, addDataContextChangeListener, ClientNotification } from "@concord-consortium/codap-plugin-api";
import { useCodapData } from "../hooks/useCodapData";
import { LocationTab } from "./location-tab";
import { SimulationTab } from "./simulation-tab";
import { Header } from "./header";

import "../assets/scss/App.scss";

const updateRowSelectionInCodap = (latitude: string, longitude: string, day: number) => {
  console.log("\n| SIM day is: ", day, " so issue API request to update selected row in CODAP ",
    "\n latitude:       ", latitude,
    "\n longitude:      ", longitude,
    "\n day:            ", day,
    "\n Math.floor(day) ", Math.floor(day));
}

const debouncedUpdateRowSelection = debounce((latitude: string, longitude: string, day: number) => {
  updateRowSelectionInCodap(latitude, longitude, Math.floor(day));
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
    debouncedUpdateRowSelection(latitude, longitude, day);
    // NOTE: not need update dayOfYear state variable. It's useful only for the opposite direction
    // it's useful when user select a row in CODAP and we want to update the day in the sim
  };

  const handleCaseSelectionInCodap = (_latitude: string, _longitude: string, day: number) => {
    console.log("| calling handleCaseSelectionInCodap with: ", _latitude, _longitude, day);
    // if user actually selected the case from the same location, then update the day of the year.
    if (latitude === _latitude && longitude === _longitude) {
      setDayOfYear(day);
    }
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
      const casesDeletedFromCodapListener = async (listenerRes: ClientNotification) => {
        const { resource, values } = listenerRes;
        const isResource = resource === `dataContextChangeNotice[${kDataContextName}]`;
        if (!isResource) return;

        const casesDeleted =
          values.operation === "selectCases"
          && values.result.cases
          && values.result.cases.length === 0
          && values.result.success;

        if ( casesDeleted ) {
          const uniqeLocations = await getUniqueLocationsRef.current();
          if (uniqeLocations) setLocations(uniqeLocations);
        }
      };
      addDataContextChangeListener(kDataContextName, casesDeletedFromCodapListener);
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
