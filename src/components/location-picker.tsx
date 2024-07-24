import React, { useState, useEffect } from "react";
import { geoNameSearch } from "../utils/geonameSearch";
import { ILocation } from "../types";

interface LocationPickerProps {
  onLocationSelect: (place: ILocation) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  searchValue,
  onSearchChange
}) => {
  const [locationCandidates, setLocationCandidates] = useState<ILocation[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      if (searchValue.length >= 3) {
        const locations = await geoNameSearch({ searchString: searchValue });
        setLocationCandidates(locations || []);
        setShowLocationDropdown(true);
      } else {
        setLocationCandidates([]);
        setShowLocationDropdown(false);
      }
    };

    fetchLocations();
  }, [searchValue]);

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleLocationSelect = (place: ILocation) => {
    onLocationSelect(place);
    setShowLocationDropdown(false);
  };

  return (
    <div className="location-picker">
      <input
        type="text"
        placeholder="Enter location"
        value={searchValue}
        onChange={handleLocationChange}
      />
      {showLocationDropdown && (
        <ul className="location-dropdown">
          {locationCandidates.map((place, index) => (
            <li key={index} onClick={() => handleLocationSelect(place)}>
              {place.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
