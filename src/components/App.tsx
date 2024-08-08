import React, { useEffect, useState, useRef } from "react";
import { clsx } from "clsx";
import { ILocation } from "../types";
import { kInitialDimensions, kVersion, kPluginName, kDefaultOnAttributes, kSimulationTabDimensions, kDataContextName } from "../constants";
import { initializePlugin, codapInterface, addDataContextChangeListener, ClientNotification } from "@concord-consortium/codap-plugin-api";
import { useCodapData } from "../hooks/useCodapData";
import { LocationTab } from "./location-tab";
import { SimulationTab } from "./simulation-tab";
import { Header } from "./header";

import "../assets/scss/App.scss";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"location" | "simulation">("location");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [dayOfYear, setDayOfYear] = useState<string>("280");
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [selectedAttrs, setSelectedAttributes] = useState<string[]>(kDefaultOnAttributes);
  const [dataContext, setDataContext] = useState<any>(null);

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
        const { resource, values } = listenerRes;
        const isResource = resource === `dataContextChangeNotice[${kDataContextName}]`;
        if (!isResource) return;

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

  const handleTabClick = (tab: "location" | "simulation") => {
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
          latitude={latitude}
          longitude={longitude}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
          setLocationSearch={setLocationSearch}
          dayOfYear={dayOfYear}
          setDayOfYear={setDayOfYear}
          locations={locations}
        />
      </div>
    </div>
  );
};
