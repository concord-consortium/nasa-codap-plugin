import React, { useEffect } from "react";
import { useCodapData } from "../hooks/useCodapData";
import { kChildCollectionAttributes } from "../constants";
import { ICodapDataContextInfo, ILocation } from "../types";
import { LocationPicker } from "./location-picker";
import { locationsEqual } from "../utils/daylight-utils";

import "../assets/scss/location-tab.scss";

interface LocationTabProps {
  latitude: string;
  longitude: string;
  locations: ILocation[];
  locationSearch: string;
  selectedAttrs: string[];
  dataContext: ICodapDataContextInfo | null;
  setLatitude: (latitude: string) => void;
  setLongitude: (longitude: string) => void;
  setLocationSearch: (search: string) => void;
  setSelectedAttributes: (attrs: string[]) => void;
  setDataContext: (context: any) => void;
  setLocations: (locations: ILocation[]) => void;
}

export const LocationTab: React.FC<LocationTabProps> = ({
  latitude,
  longitude,
  locationSearch,
  selectedAttrs,
  locations,
  setLatitude,
  setLongitude,
  setLocationSearch,
  setSelectedAttributes,
  setLocations
}) => {

  const {
    dataContext,
    handleClearData,
    getDayLengthData,
    updateAttributeVisibility,
    getUniqueLocationsInCodapData
  } = useCodapData();

  useEffect(() => {
    const updateEachAttrVisibility = () => {
      for (const attr of kChildCollectionAttributes) {
        const isSelected = selectedAttrs.includes(attr.name);
        updateAttributeVisibility(attr.name, !isSelected);
      }
    };

    updateEachAttrVisibility();
  }, [selectedAttrs, updateAttributeVisibility]);

  const handleLatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLatitude(event.target.value);
    setLocationSearch("");
  };

  const handleLongChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLongitude(event.target.value);
    setLocationSearch("");
  };

  const handleLocationSelect = (selectedLocation: ILocation) => {
    setLatitude(selectedLocation.latitude.toString());
    setLongitude(selectedLocation.longitude.toString());
    setLocationSearch(selectedLocation.name);
  };

  const handleLocationSearchChange = (searchString: string) => {
    setLocationSearch(searchString);
  };

  const handleTokenClick = (attribute: string) => {
    if (selectedAttrs.includes(attribute)) {
      setSelectedAttributes(selectedAttrs.filter(attr => attr !== attribute));
    } else {
      setSelectedAttributes([...selectedAttrs, attribute]);
    }
  };

  const handleClearDataClick = async () => {
    await handleClearData();
    setLocations([]);
  };

  const handleGetDataClick = async () => {
    const name = locationSearch || `(${latitude}, ${longitude})`;
    const currentLocation: ILocation = { name, latitude: Number(latitude), longitude: Number(longitude) };
    const locationExists = locations.some(item => locationsEqual(item, currentLocation));
    if (locationExists || !latitude || !longitude) return;

    // if the location does not already exist, and we have params, get the data
    const tableCreated = await getDayLengthData(currentLocation);
    if (tableCreated?.success) {
      const uniqeLocations = await getUniqueLocationsInCodapData();
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
    </div>
  );
};
