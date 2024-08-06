import React, { useEffect, useState } from "react";
import { clsx } from "clsx";
import { ILocation } from "../types";
import { kInitialDimensions, kVersion, kPluginName, kDefaultOnAttributes, kSimulationTabDimensions } from "../constants";
import { initializePlugin, codapInterface } from "@concord-consortium/codap-plugin-api";
import { LocationTab } from "./location-tab";
import { SimulationTab } from "./simulation-tab";
import { Header } from "./header";

import "../assets/scss/App.scss";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"location" | "simulation">("location");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [dayOfYear, setDayOfYear] = useState<string>("280");
  const [location, setLocation] = useState<ILocation | null>(null);
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [selectedAttrs, setSelectedAttributes] = useState<string[]>(kDefaultOnAttributes);
  const [dataContext, setDataContext] = useState<any>(null);

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
          location={location}
          locationSearch={locationSearch}
          selectedAttrs={selectedAttrs}
          dataContext={dataContext}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
          setLocation={setLocation}
          setLocationSearch={setLocationSearch}
          setSelectedAttributes={setSelectedAttributes}
          setDataContext={setDataContext}
        />
      </div>
      <div className={clsx("tab-content", { active: activeTab === "simulation" })}>
        <SimulationTab
          latitude={latitude}
          longitude={longitude}
          dayOfYear={dayOfYear}
          location={location}
          setDayOfYear={setDayOfYear}
        />
      </div>
    </div>
  );
};
