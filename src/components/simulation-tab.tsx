import React from "react";
import { ILocation } from "../types";
import { useCodapData } from "../hooks/useCodapData";
import Seasons from "../grasp-seasons/components/seasons";
import { locationsEqual } from "../utils/daylight-utils";

import "../assets/scss/simulation-tab.scss";

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
  setLocations
}) => {

  const { getDayLengthData, getUniqueLocationsInCodapData } = useCodapData();

  const handleGetDataClick = async () => {
    const name = `(${latitude}, ${longitude})`;
    const currentLocation: ILocation = { name, latitude: Number(latitude), longitude: Number(longitude) };
    const locationExists = locations.some(item => locationsEqual(item, currentLocation));
    if (locationExists || !latitude || !longitude) return;

    const tableCreated = await getDayLengthData(currentLocation);
    if (tableCreated?.success) {
      const uniqueLocations = await getUniqueLocationsInCodapData();
      if (uniqueLocations) setLocations(uniqueLocations);
    }
  }

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
      <button className="get-data-button" onClick={handleGetDataClick}>
        Get Data
      </button>
    </div>
  );
};
