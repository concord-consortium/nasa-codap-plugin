import React, { useEffect, useState } from "react";
import { useCodapData } from "../hooks/useCodapData";
import { kChildCollectionAttributes, kDefaultOnAttributes } from "../constants";
import { ILocation } from "../types";
import { LocationPicker } from "./location-picker";
import { formatLatLongNumber } from "../utils/daylight-utils";

import "./location-tab.scss";
import "./get-data-button.scss";

export const LocationTab: React.FC = () => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [selectedAttrs, setSelectedAttributes] = useState<string[]>(kDefaultOnAttributes);
  const [requestInProgress, setRequestInProgress] = useState(false);
  const [anyDataRequested, setAnyDataRequested] = useState(false);
  const { handleClearData, getDayLengthAndNASAData, updateAttributeVisibility } = useCodapData();

  const enableGetData = latitude !== "" && longitude !== "" && startDate !== "" && endDate !== "" && !requestInProgress;

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

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
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

  const handleGetDataClick = async () => {
    const name = locationSearch || `(${latitude}, ${longitude})`;
    const currentLocation: ILocation = { name, latitude: Number(latitude), longitude: Number(longitude) };
    if (!latitude || !longitude || !startDate || !endDate) return;

    // if the location does not already exist, and we have params, get the data
    setRequestInProgress(true);
    try {
      await getDayLengthAndNASAData(currentLocation, startDate, endDate, selectedAttrs);
      setAnyDataRequested(true);
    } catch (error: any) {
      window.alert(error.message);
    } finally {
      setRequestInProgress(false);
    }
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
            onChange={handleStartDateChange}
          />
          to
          <input
            type="date"
            placeholder="End Date"
            onChange={handleEndDateChange}
          />
        </div>
      </div>
      <hr className="light above-attrs"/>
      <div className="plugin-row attributes-selection">
        <label>Attribute Categories</label>
        <ul className="attribute-tokens">
          {/* { kChildCollectionAttributes.map((attr: any, i: number) => (
            attr.hasToken && (
              <li
                key={i}
                className={`token ${selectedAttrs.includes(attr.name) ? "on" : "off"}`}
                onClick={() => handleTokenClick(attr.name)}
              >
                { attr.title }
              </li>
            )))
          } */}
        </ul>
        <hr className="light"/>
      </div>
      <div className="plugin-row data-buttons">
        <button
          className="clear-data-button"
          disabled={!anyDataRequested}
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
