import React from "react";
import { ILocation } from "../types";
import Seasons from "../grasp-seasons/components/seasons";

import "../assets/scss/simulation-tab.scss";

interface SimulationTabProps {
  latitude: string;
  longitude: string;
  dayOfYear: string;
  locations: ILocation[];
  setLatitude: (latitude: string) => void;
  setLongitude: (longitude: string) => void;
  setLocationSearch: (search: string) => void;
  setDayOfYear: (day: string) => void;
}

export const SimulationTab: React.FC<SimulationTabProps> = ({
  latitude,
  longitude,
  locations,
  dayOfYear,
  setDayOfYear,
  setLatitude,
  setLongitude,
  setLocationSearch
}) => {
  return (
    <div className="simulation-tab">
      <div className="seasons-container">
        <Seasons
          latitude={latitude}
          longitude={longitude}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
          setLocationSearch={setLocationSearch}
          locations={locations}
        />
      </div>
    </div>
  );
};
