import React from "react";

import "../assets/scss/header.scss";

interface IHeaderProps {
  activeTab: "location" | "simulation" | "about";
  onTabClick: (tab: "location" | "simulation" | "about") => void;
}

export const Header: React.FC<IHeaderProps> = ({ activeTab, onTabClick }) => {
  return (
    <>
      <div className="plugin-row header">
        <p>
          How long is a day?<br />
          Enter a location or coordinates to retrieve data
        </p>
      </div>
      <hr />
      <div className="tab-container">
        <div
          className={`tab ${activeTab === "location" ? "active" : ""}`}
          onClick={() => onTabClick("location")}
        >
          Location
        </div>
        <div
          className={`tab ${activeTab === "simulation" ? "active" : ""}`}
          onClick={() => onTabClick("simulation")}
        >
          Simulation
        </div>
        <div
          className={`tab ${activeTab === "about" ? "active" : ""}`}
          onClick={() => onTabClick("about")}
        >
          About
        </div>
      </div>
    </>
  );
};
