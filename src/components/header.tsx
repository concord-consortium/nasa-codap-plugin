import React from "react";
import { TabName } from "../types";

import "../assets/scss/header.scss";

interface IHeaderProps {
  activeTab: TabName;
  onTabClick: (tab: TabName) => void;
  showEnabled: boolean;
}

export const Header: React.FC<IHeaderProps> = ({ activeTab, onTabClick, showEnabled }) => {
  return (
    <div className="tab-container">
      <div
        className={`tab location ${activeTab === "location" ? "active" : ""}`}
        onClick={() => onTabClick("location")}
      >
        Location
      </div>
      <div
        className={`tab simulation ${activeTab === "simulation" ? "active" : ""} ${showEnabled ? "" : "disabled"}`}
        onClick={() => onTabClick("simulation")}
      >
        Simulation
      </div>
      <div
        className={`tab about ${activeTab === "about" ? "active" : ""}`}
        onClick={() => onTabClick("about")}
      >
        About
      </div>
    </div>
  );
};
