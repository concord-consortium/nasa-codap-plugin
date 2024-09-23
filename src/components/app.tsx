import React, { useEffect, useState } from "react";
import { clsx } from "clsx";
import { TabName } from "../types";
import { kInitialDimensions, kVersion, kPluginName } from "../constants";
import { initializePlugin, selectSelf } from "@concord-consortium/codap-plugin-api";
import { LocationTab } from "./location-tab";
import { AboutTab } from "./about-tab";
import { GlossaryTab } from "./glossary-tab";
import { Header } from "./header";

import "./app.scss";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>("location");

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

  return (
    <div className="app" onClick={selectSelf}>
      <Header activeTab={activeTab} onTabClick={handleTabClick} />
      <div className={clsx("tab-content", { active: activeTab === "location" })}>
        <LocationTab />
      </div>
      <div className={clsx("tab-content", { active: activeTab === "glossary" })}>
        <GlossaryTab />
      </div>
      <div className={clsx("tab-content", { active: activeTab === "about" })}>
        <AboutTab />
      </div>
    </div>
  );
};
