import React, { useState, useEffect } from "react";
import { geoNameSearch } from "../utils/geonameSearch";
import { ILocation } from "../types";

import LocationIcon from "../assets/images/icon-location.svg";
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
  const [focusedLocationIndex, setFocusedLocationIndex] = useState(-1);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target instanceof HTMLElement) {
        if (!event.target.closest(".location-picker")) {
          setShowLocationDropdown(false);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleLocationSelect = (place: ILocation) => {
    onLocationSelect(place);
    setShowLocationDropdown(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showLocationDropdown) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setFocusedLocationIndex(prevIndex =>
          prevIndex < locationCandidates.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusedLocationIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
        break;
      case "Enter":
        event.preventDefault();
        if (focusedLocationIndex >= 0 && focusedLocationIndex < locationCandidates.length) {
          handleLocationSelect(locationCandidates[focusedLocationIndex]);
        }
        break;
      case "Escape":
        setShowLocationDropdown(false);
        setFocusedLocationIndex(-1);
        break;
    }
  };

  return (
    <div className="plugin-row location-picker">
      <label>Location</label>
      <LocationIcon className="location-icon" />
      <input
        type="text"
        placeholder="Enter location"
        value={searchValue}
        onChange={handleLocationChange}
        onKeyDown={handleKeyDown}
      />
      {showLocationDropdown && locationCandidates.length > 0 && (
        <ul className="location-dropdown">
          {locationCandidates.map((place, index) => (
            <li
              key={index}
              onClick={() => handleLocationSelect(place)}
              onMouseEnter={() => setFocusedLocationIndex(index)}
              className={focusedLocationIndex === index ? "focused" : ""}
            >
              {place.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
