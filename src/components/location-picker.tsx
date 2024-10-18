import React, { useState, useEffect } from "react";
import { geoNameSearch } from "../utils/geonameSearch";
import { ILocation } from "../types";
import { Dropdown } from "./dropdown";
import LocationIcon from "../assets/images/icon-location.svg";

interface LocationPickerProps {
  searchValue: string;
  autoFindingLocation: boolean;
  onLocationSelect: (place: ILocation) => void;
  onSearchChange: (value: string) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  searchValue,
  autoFindingLocation,
  onLocationSelect,
  onSearchChange
}) => {
  const [locationCandidates, setLocationCandidates] = useState<ILocation[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      if (searchValue.length >= 3) {
        const locations = await geoNameSearch({ searchString: searchValue });
        setLocationCandidates(locations || []);
      } else {
        setLocationCandidates([]);
      }
    };

    fetchLocations();
  }, [searchValue]);

  return (
    <Dropdown<ILocation>
      label="Location"
      inputPlaceholder={autoFindingLocation ? "Searching for your location..." : "City, State or Country"}
      dropdownOffset="10px"
      value={searchValue}
      options={locationCandidates}
      onSelect={onLocationSelect}
      onSearchChange={onSearchChange}
      icon={<LocationIcon />}
    />
  );
};
