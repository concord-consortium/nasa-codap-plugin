import React, { useEffect } from "react";
import { useCodapData } from "../hooks/useCodapData";
import { kChildCollectionAttributes } from "../constants";
import { ICodapDataContextInfo, ILocation } from "../types";
import { LocationPicker } from "./location-picker";
import { formatLatLongNumber } from "../utils/daylight-utils";

import "./location-tab.scss";
import "./get-data-button.scss";

interface LocationTabProps {
  latitude: string;
  longitude: string;
  locationSearch: string;
  selectedAttrs: string[];
  dataContext: ICodapDataContextInfo | null;
  setLatitude: (latitude: string) => void;
  setLongitude: (longitude: string) => void;
  setLocationSearch: (search: string) => void;
  setSelectedAttributes: (attrs: string[]) => void;
  handleGetDataClick: () => void;
}

export const LocationTab: React.FC<LocationTabProps> = ({
  latitude,
  longitude,
  locationSearch,
  selectedAttrs,
  setLatitude,
  setLongitude,
  setLocationSearch,
  setSelectedAttributes,
  handleGetDataClick,
}) => {

  const enableGetData = latitude !== "" && longitude !== "";

  const {
    handleClearData,
    updateAttributeVisibility,
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
    setLatitude(formatLatLongNumber(selectedLocation.latitude));
    setLongitude(formatLatLongNumber(selectedLocation.longitude));
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
  };

  return (
    <div className="location-tab">
      <div className="intro">
        Get sunlight, temperature, or water data for any location on Earth.
      </div>
      <hr />
      <div className="location-picker">
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          searchValue={locationSearch}
          onSearchChange={handleLocationSearchChange}
        />
      </div>
      <div className="or-container">
        <hr className="light" />
        <span className="or">OR</span>
      </div>
      <div className="plugin-row">
        <div className="latitude">
          <label>Latitude</label>
          <input
            type="text"
            placeholder="Coordinate"
            value={latitude}
            onChange={handleLatChange}
          />
        </div>
        <div className="longitude">
          <label>Longitude</label>
          <input
            type="text"
            placeholder="Coordinate"
            value={longitude}
            onChange={handleLongChange}
          />
        </div>
      </div>
      <hr className="light"/>
      <div className="plugin-row date-range">
        <div className="label-container">
          <label>Date Range</label>
        </div>
        <div className="date-inputs">
          <input
            type="date"
            placeholder="Start Date"
          />
          to
          <input
            type="date"
            placeholder="End Date"
          />
        </div>
      </div>
      <hr className="light above-attrs"/>
      <div className="plugin-row attributes-selection">
        <label>Attribute Categories</label>
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
        <hr className="light"/>
      </div>
      <div className="plugin-row data-buttons">
        <button
          className="clear-data-button"
          onClick={handleClearDataClick}
        >
          Clear Data
        </button>
        <button
          className="get-data-button"
          disabled={!enableGetData}
          onClick={handleGetDataClick}
        >
          Get Data
        </button>
      </div>
    </div>
  );
};
