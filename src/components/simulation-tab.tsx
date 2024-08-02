import React from "react";
import { ILocation } from "../types";
import { OrbitSystem } from "./orbit-system";

import "../assets/scss/simulation-tab.scss";

interface SimulationTabProps {
  latitude: string;
  longitude: string;
  dayOfYear: string;
  location: ILocation | null;
  setDayOfYear: (day: string) => void;
}

export const SimulationTab: React.FC<SimulationTabProps> = ({
  latitude,
  longitude,
  dayOfYear,
  setDayOfYear,
  location
}) => {

  const handleDayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDayOfYear(event.target.value);
  };

  return (
    <div className="simulation-tab">
      <div className="plugin-row day-slider">
        <label>Day of Year</label>
        <input
          type="range"
          min="0"
          max="364"
          value={dayOfYear}
          onChange={handleDayChange}
        />
      </div>
      <div className="plugin-row sim">
        <OrbitSystem
          latitude={parseFloat(latitude) || 0}
          longitude={parseFloat(longitude) || 0}
          dayOfYear={parseInt(dayOfYear, 10) || 0}
        />
      </div>

      <div className="location-info">
        <pre>Location Name: {location?.name}</pre>
        <pre>Latitude: {latitude}</pre>
        <pre>Longitude: {longitude}</pre>
      </div>

    </div>
  );
};
