import React, { useEffect, useState, useRef } from "react";
import { clsx } from "clsx";
import { ILocation } from "../types";
import { kInitialDimensions, kVersion, kPluginName, kDefaultOnAttributes, kSimulationTabDimensions, kDataContextName } from "../constants";
import { initializePlugin, codapInterface, addDataContextChangeListener, ClientNotification } from "@concord-consortium/codap-plugin-api";
import { useCodapData } from "../hooks/useCodapData";
import { LocationTab } from "./location-tab";
import { SimulationTab } from "./simulation-tab";
import { AboutTab } from "./about-tab";
import { Header } from "./header";

import "../assets/scss/App.scss";

const updateRowSelectionInCodap = (latitude: string, longitude: string, day: number) => {
  // TODO: Issue CODAP API request to highlight appropriate case in the case table, using combination of
  // Math.floor(day), latitude, and longitude.
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"location" | "simulation" | "about">("location");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [dayOfYear, setDayOfYear] = useState(171);
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [selectedAttrs, setSelectedAttributes] = useState<string[]>(kDefaultOnAttributes);
  const [dataContext, setDataContext] = useState<any>(null);

  const handleDayUpdateInTheSimTab = (day: number) => {
    console.log("The day of the year has been updated in the simulation tab to: ", day); // TODO: remove it later
    // We might to debounce this call, as if the animation is on, or user is dragging the slider, there will be
    // lot of events and API calls to CODAP.
    updateRowSelectionInCodap(latitude, longitude, Math.floor(day));
    // Note that we do not need to update dayOfYear state variable. It's useful only for the opposite direction
    // of the sync process, when user select a row in CODAP and we want to update the day in the simulation tab.
  };

  const handleCaseSelectionInCodap = (_latitude: string, _longitude: string, day: number) => {
    // Option 1. Update as much of the plugin state as we can when user selects a case in CODAP. I think this might
    // be too much, as it'll clear all the inputs in all the tabs and the user will have to re-enter everything
    // if they were in the middle of something.
    // setDayOfYear(day);
    // setLatitude(_latitude);
    // setLongitude(_longitude);
    // ...OR...
    // Option 2. Update only the day of the year, as that's reasonably unobtrusive and useful. We can first check
    // if user actually selected the case from the same location, and only then update the day of the year.
    if (latitude === _latitude && longitude === _longitude) {
      setDayOfYear(day);
    }
  }

  const { getUniqueLocationsInCodapData } = useCodapData();
  // Store a ref to getUniqueLocationsInCodapData so we can call inside useEffect without triggering unnecessary re-runs
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

      const casesDeletedFromCodapListener = async (listenerRes: ClientNotification) => {
        console.log("|| listenerRes: ", listenerRes);
        const { resource, values } = listenerRes;
        const isResource = resource === `dataContextChangeNotice[${kDataContextName}]`;
        if (!isResource && !values.result.cases) return;
        const hasCasesDefined = values.result.cases !== undefined;
        if (!hasCasesDefined) return
        const casesDeleted = values.operation === "selectCases" && values.result.cases.length === 0 && values.result.success;

        if ( casesDeleted ) {
          const uniqeLocations = await getUniqueLocationsRef.current();
          if (uniqeLocations) setLocations(uniqeLocations);
        }
      };
      addDataContextChangeListener(kDataContextName, casesDeletedFromCodapListener);
    };

    initialize();
  }, []);

  const handleTabClick = (tab: "location" | "simulation" | "about") => {
    setActiveTab(tab);
    // Update dimensions of the plugin window when switching tabs.
    codapInterface.sendRequest({
      action: "update",
      resource: "interactiveFrame",
      values: {
        dimensions: tab === "location" ? kInitialDimensions : kSimulationTabDimensions
      }
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
          setLocations={setLocations}
        />
      </div>
      <div className={clsx("tab-content", { active: activeTab === "about" })}>
        <AboutTab />
      </div>
    </div>
  );
};
