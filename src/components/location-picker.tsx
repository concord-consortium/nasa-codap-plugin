import React, { useState, useEffect } from "react";
import { geoNameSearch } from "../utils/geonameSearch";
import { ILocation } from "../types";
import { Dropdown } from "./dropdown";
import LocationIcon from "../assets/images/icon-location.svg";

interface LocationPickerProps {
  searchValue: string;
  onLocationSelect: (place: ILocation) => void;
  onSearchChange: (value: string) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  searchValue,
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
      inputPlaceholder="City, State or Country"
      value={searchValue}
      options={locationCandidates}
      onSelect={onLocationSelect}
      onSearchChange={onSearchChange}
      icon={<LocationIcon />}
    />
  );
};
