import React from "react";
import { ILocation } from "../types";
import Seasons from "../grasp-seasons/components/seasons";

import "./simulation-tab.scss";

interface SimulationTabProps {
  locations: ILocation[];
  latitude: string;
  longitude: string;
  setLatitude: (latitude: string) => void;
  setLongitude: (longitude: string) => void;
  setLocationSearch: (search: string) => void;
  dayOfYear: number;
  setDayOfYear: (day: number) => void;
  setLocations: (locations: ILocation[]) => void;
  handleGetDataClick: (latitude: string, longitude: string) => void;
}

export const SimulationTab: React.FC<SimulationTabProps> = ({
  locations,
  latitude,
  longitude,
  setLatitude,
  setLongitude,
  setLocationSearch,
  dayOfYear,
  setDayOfYear,
  setLocations,
  handleGetDataClick
}) => {
  return (
    <div className="simulation-tab">
      <div className="seasons-container">
        <Seasons
          dayOfYear={dayOfYear}
          setDayOfYear={setDayOfYear}
          latitude={latitude}
          longitude={longitude}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
          setLocationSearch={setLocationSearch}
          locations={locations}
        />
      </div>
      <button className="get-data-button" onClick={() => handleGetDataClick(latitude, longitude)}>
        Get Data
      </button>
    </div>
  );
};
