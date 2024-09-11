import React, { useEffect, useState } from "react";
import { clsx } from "clsx";
import { ILocation, TabName } from "../types";
import { kInitialDimensions, kVersion, kPluginName, kDefaultOnAttributes } from "../constants";
import { initializePlugin, selectSelf } from "@concord-consortium/codap-plugin-api";
import { useCodapData } from "../hooks/useCodapData";
import { LocationTab } from "./location-tab";
import { AboutTab } from "./about-tab";
import { Header } from "./header";

import "./app.scss";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>("location");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [selectedAttrs, setSelectedAttributes] = useState<string[]>(kDefaultOnAttributes);

  const { getDayLengthData, dataContext } = useCodapData();

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

  const handleTabClick = (tab: TabName) => {
    setActiveTab(tab);
  };

  const handleGetDataClick = async () => {
    const name = locationSearch || `(${latitude}, ${longitude})`;
    const currentLocation: ILocation = { name, latitude: Number(latitude), longitude: Number(longitude) };
    if (!latitude || !longitude) return;

    // if the location does not already exist, and we have params, get the data
    await getDayLengthData(currentLocation, selectedAttrs);
  };

  return (
    <div className="app" onClick={selectSelf}>
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
          handleGetDataClick={handleGetDataClick}
        />
      </div>
      <div className={clsx("tab-content", { active: activeTab === "glossary" })}>
        <AboutTab />
      </div>
      <div className={clsx("tab-content", { active: activeTab === "about" })}>
        <AboutTab />
      </div>
    </div>
  );
};
