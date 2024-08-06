import React from "react";
import { ILocation } from "../types";
import Seasons from "../grasp-seasons/components/seasons";

import "../assets/scss/simulation-tab.scss";

interface SimulationTabProps {
  latitude: string;
  longitude: string;
  dayOfYear: string;
  location: ILocation | null;
  userLocations: ILocation[];
  setDayOfYear: (day: string) => void;
}

export const SimulationTab: React.FC<SimulationTabProps> = ({
  latitude,
  longitude,
  dayOfYear,
  setDayOfYear,
  location,
  userLocations
}) => {

  return (
    <div className="simulation-tab">
      <div className="seasons-container">
        <Seasons />
      </div>
    </div>
  );
};
