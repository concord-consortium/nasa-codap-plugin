import React from "react";

import "../assets/scss/header.scss";

interface IHeaderProps {
  activeTab: "location" | "simulation" | "about";
  onTabClick: (tab: "location" | "simulation" | "about") => void;
}

export const Header: React.FC<IHeaderProps> = ({ activeTab, onTabClick }) => {
  return (
    <div className="tab-container">
      <div
        className={`tab location ${activeTab === "location" ? "active" : ""}`}
        onClick={() => onTabClick("location")}
      >
        Location
      </div>
      <div
        className={`tab simulation ${activeTab === "simulation" ? "active" : ""}`}
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
