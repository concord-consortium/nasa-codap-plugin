import React, { useEffect, useState } from "react";
import { ILocation } from "../types";
import { kInitialDimensions, kVersion, kPluginName, kDefaultOnAttributes } from "../constants";
import { initializePlugin } from "@concord-consortium/codap-plugin-api";
import { LocationTab } from "./location-tab";
import { SimulationTab } from "./simulation-tab";
import InfoIcon from "../assets/images/icon-info.svg";
import "./App.scss";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"location" | "simulation">("location");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [dayOfYear, setDayOfYear] = useState<string>("280");
  const [location, setLocation] = useState<ILocation | null>(null);
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [selectedAttrs, setSelectedAttributes] = useState<string[]>(kDefaultOnAttributes);
  const [dataContext, setDataContext] = useState<any>(null);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  useEffect(() => {
    initializePlugin({
      pluginName: kPluginName,
      version: kVersion,
      dimensions: kInitialDimensions
    });
  }, []);

  const handleOpenInfo = () => {
    setShowInfo(!showInfo);
  };

  return (
    <div className="App">
      <div className="plugin-row top">
        <p>
          How long is a day?<br />
          Enter a location or coordinates to retrieve data
        </p>
        <span title="Get further information about this CODAP plugin">
          <InfoIcon className="info-icon" onClick={handleOpenInfo}/>
        </span>
        <div className={`plugin-info-popup ${showInfo ? "showing" : "hidden"}`}>
          plugin info
        </div>
      </div>
      <hr />
      <div className="tab-container">
        <div
          className={`tab ${activeTab === "location" ? "active" : ""}`}
          onClick={() => setActiveTab("location")}
        >
          Location
        </div>
        <div
          className={`tab ${activeTab === "simulation" ? "active" : ""}`}
          onClick={() => setActiveTab("simulation")}
        >
          Simulation
        </div>
      </div>
      {activeTab === "location" ? (
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
      ) : (
        <SimulationTab
          latitude={latitude}
          longitude={longitude}
          dayOfYear={dayOfYear}
          location={location}
          setDayOfYear={setDayOfYear}
        />
      )}
    </div>
  );
};
