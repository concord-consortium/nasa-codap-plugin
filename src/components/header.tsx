import React, { useState } from "react";
import InfoIcon from "../assets/images/icon-info.svg";

import "../assets/scss/header.scss";

interface IHeaderProps {
  activeTab: "location" | "simulation";
  onTabClick: (tab: "location" | "simulation") => void;
}

export const Header: React.FC<IHeaderProps> = ({ activeTab, onTabClick }) => {
  const [showInfo, setShowInfo] = useState<boolean>(false);

  const handleInfoClick = () => {
    setShowInfo(!showInfo);
  };

  return (
    <>
      <div className="plugin-row header">
        <p>
          How long is a day?<br />
          Enter a location or coordinates to retrieve data
        </p>
        <span title="Get further information about this CODAP plugin">
          <InfoIcon className="info-icon" onClick={handleInfoClick}/>
        </span>
        <div className={`plugin-info-popup ${showInfo ? "showing" : "hidden"}`}>
          plugin info
        </div>
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
      </div>
    </>
  );
};
