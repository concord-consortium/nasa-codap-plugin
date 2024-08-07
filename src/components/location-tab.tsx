import React, { useEffect } from "react";
import { useCodapData } from "../hooks/useCodapData";
import { kChildCollectionAttributes } from "../constants";
import { ILocation } from "../types";
import { LocationPicker } from "./location-picker";

import "../assets/scss/location-tab.scss";

interface LocationTabProps {
  latitude: string;
  longitude: string;
  location: ILocation | null;
  locations: ILocation[];
  locationSearch: string;
  selectedAttrs: string[];
  dataContext: any; // TODO the type
  setLatitude: (latitude: string) => void;
  setLongitude: (longitude: string) => void;
  setLocation: (location: ILocation | null) => void;
  setLocationSearch: (search: string) => void;
  setSelectedAttributes: (attrs: string[]) => void;
  setDataContext: (context: any) => void; // TODO the type
  setLocations: (locations: ILocation[]) => void;
}

export const LocationTab: React.FC<LocationTabProps> = ({
  latitude,
  longitude,
  location,
  locationSearch,
  selectedAttrs,
  locations,
  setLatitude,
  setLongitude,
  setLocation,
  setLocationSearch,
  setSelectedAttributes,
  setLocations
}) => {
  const {
    dataContext,
    handleClearDataClick,
    getDayLengthData,
    updateAttributeVisibility,
    calculateUniqueUserLocations
  } = useCodapData();

  useEffect(() => {
    const updateAttributesVisibility = async () => {
      for (const attr of kChildCollectionAttributes) {
        const isSelected = selectedAttrs.includes(attr.name);
        await updateAttributeVisibility(attr.name, !isSelected);
      }
    };

    updateAttributesVisibility();
  }, [selectedAttrs, updateAttributeVisibility]);

  const handleLatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLatitude(event.target.value);
    setLocation(null);
    setLocationSearch("");
  };

  const handleLongChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLongitude(event.target.value);
    setLocation(null);
    setLocationSearch("");
  };

  const handleLocationSelect = (selectedLocation: ILocation) => {
    setLocation(selectedLocation);
    setLatitude(selectedLocation.latitude.toString());
    setLongitude(selectedLocation.longitude.toString());
    setLocationSearch(selectedLocation.name);
  };

  const handleLocationSearchChange = (searchString: string) => {
    setLocationSearch(searchString);
    if (searchString === "") {
      setLocation(null);
    }
  };

  const handleTokenClick = (attribute: string) => {
    if (selectedAttrs.includes(attribute)) {
      setSelectedAttributes(selectedAttrs.filter(attr => attr !== attribute));
    } else {
      setSelectedAttributes([...selectedAttrs, attribute]);
    }
  };

  const handleGetDataClick = async () => {
    const locationExists = locations.some(item =>
      item.latitude === location?.latitude && item.longitude === location.longitude
    );
    if (locationExists || !latitude || !longitude) return;
    // TODO separate this logic above ...
    // TODO we should be doing this on an effect not on this click
    // then we could be removing items when the location is removed without a listener, we'd
    // just circle back to the CODAP data reliably.

    const tableCreated = await getDayLengthData(Number(latitude), Number(longitude), location);
    if (tableCreated?.success) {
      const uniqeLocations = await calculateUniqueUserLocations();
      if (uniqeLocations) setLocations(uniqeLocations);
    }
  };

  return (
    <div className="location-tab">
      <LocationPicker
        onLocationSelect={handleLocationSelect}
        searchValue={locationSearch}
        onSearchChange={handleLocationSearchChange}
      />
      <div className="or">OR</div>
      <hr />
      <div className="plugin-row latitude">
        <label>Latitude</label>
        <input
          type="text"
          placeholder="latitude"
          value={latitude}
          onChange={handleLatChange}
        />
      </div>
      <div className="plugin-row longitude">
        <label>Longitude</label>
        <input
          type="text"
          placeholder="longitude"
          value={longitude}
          onChange={handleLongChange}
        />
      </div>
      <hr />
      <div className="plugin-row attributes-selection">
        <label>Attributes</label>
        <ul className="attribute-tokens">
          { kChildCollectionAttributes.map((attr: any, i: number) => (
            attr.hasToken && (
              <li
                key={i}
                className={`token ${selectedAttrs.includes(attr.name) ? "on" : "off"}`}
                onClick={() => handleTokenClick(attr.name)}
              >
                { attr.title }
              </li>
            )))
          }
        </ul>
      </div>
      <div className="plugin-row data-buttons">
        <button onClick={handleClearDataClick} disabled={!dataContext}>
          Clear Data
        </button>
        <button onClick={handleGetDataClick}>
          Get Data
        </button>
      </div>
      { locations && locations.length > 0 && (
        <div className="plugin-row user-locations">
          <label>User Locations</label>
          <ul>
            {locations.map((loc, i) => (
              <li key={i}>
                {loc.name} ({loc.latitude}, {loc.longitude})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
