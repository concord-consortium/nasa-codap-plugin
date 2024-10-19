import React, { useEffect, useState } from "react";
import { getDayLengthAndNASAData, clearData, updateAttributeVisibility, updateAttributeUnits } from "../utils/codap-utils";
import { createItems } from "@concord-consortium/codap-plugin-api";
import { kAttrCategories, kChildCollectionAttributes, kDataContextName } from "../constants";
import { AttributeCategory, ILocation, Units } from "../types";
import { LocationPicker } from "./location-picker";
import { formatLatLongNumber } from "../utils/daylight-utils";
import { defaultEnd, defaultStart } from "../utils/date-utils";
import { findNearestLocation } from "../utils/geonameSearch";

import ProgressIndicator from "../assets/images/progress-indicator.svg";
import DoneIcon from "../assets/images/done.svg";
import WarningIcon from "../assets/images/warning.svg";

import "./location-tab.scss";
import "./get-data-button.scss";

type DataStatus = "" | "retrieving" | "retrieved" | "incomplete" | "error";

export const LocationTab: React.FC = () => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [startDate, setStartDate] = useState(defaultEnd);
  const [endDate, setEndDate] = useState(defaultStart);
  const [units, setUnits] = useState<Units>("imperial");
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [selectedAttrCategories, setSelectedAttrCategories] = useState<AttributeCategory[]>(kAttrCategories);
  const [dataStatus, setDataStatus] = useState<DataStatus>("");
  const [codapCases, setCodapCases] = useState<Record<Units, Record<string, any>[]> | undefined>();
  const [autoFindingLocation, setAutoFindingLocation] = useState(false);

  const enableGetData = latitude !== "" && longitude !== "" && startDate !== "" && endDate !== "" && dataStatus !== "retrieving";

  useEffect(() => {
    // use current location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const [lat, long] = [position.coords.latitude, position.coords.longitude];

        const getNearest = async () => {
          let nearest: ILocation | undefined = undefined;
          try {
            nearest = await findNearestLocation(lat, long);
          } catch (e) {
            console.error(e);
          }

          setAutoFindingLocation(false);

          if (nearest) {
            setLatitude(formatLatLongNumber(nearest.latitude));
            setLongitude(formatLatLongNumber(nearest.longitude));
            setLocationSearch(nearest.name);
          } else {
            setLatitude(formatLatLongNumber(lat));
            setLongitude(formatLatLongNumber(long));
          }
        };

        setAutoFindingLocation(true);
        getNearest();
      });
    }
  }, []);

  useEffect(() => {
    const updateEachAttrVisibility = () => {
      for (const attr of kChildCollectionAttributes) {
        if (attr.category) {
          const isSelected = selectedAttrCategories.includes(attr.category);
          updateAttributeVisibility(attr.name, !isSelected);
        }
      }
    };

    updateEachAttrVisibility();
  }, [selectedAttrCategories]);

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

  const handleTokenClick = (attribute: AttributeCategory) => {
    if (selectedAttrCategories.includes(attribute)) {
      setSelectedAttrCategories(selectedAttrCategories.filter(attr => attr !== attribute));
    } else {
      setSelectedAttrCategories([...selectedAttrCategories, attribute]);
    }
  };

  const handleUnitsChange = async (newUnits: Units) => {
    setUnits(newUnits);

    if (codapCases) {
      await clearData();
      await createItems(kDataContextName, codapCases[newUnits]);
      await updateAttributeUnits(newUnits);
    }
  };

  const handleClearDataClick = async () => {
    await clearData();
    setCodapCases(undefined);
    setDataStatus("");
  };

  const handleGetDataClick = async () => {
    const name = locationSearch || `(${latitude}, ${longitude})`;
    const currentLocation: ILocation = { name, latitude: Number(latitude), longitude: Number(longitude) };
    if (!latitude || !longitude || !startDate || !endDate) return;

    // if the location does not already exist, and we have params, get the data
    setDataStatus("retrieving");
    try {
      const { dataComplete, codapCasesImperial, codapCasesMetric } = await getDayLengthAndNASAData(currentLocation, startDate, endDate, selectedAttrCategories, units);
      setCodapCases(prevCases => ({
        imperial: [...(prevCases?.imperial || []), ...codapCasesImperial],
        metric: [...(prevCases?.metric || []), ...codapCasesMetric]
      }));
      setDataStatus(dataComplete ? "retrieved" : "incomplete");
    } catch (error: any) {
      window.alert(error.message);
      setDataStatus("error");
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
          autoFindingLocation={autoFindingLocation}
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
            value={startDate}
            onChange={handleStartDateChange}
          />
          to
          <input
            type="date"
            placeholder="End Date"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </div>
      </div>
      <hr className="light above-attrs"/>
      <div className="plugin-row attributes-selection">
        <div className="attributes-header">
          <div><label>Attribute Categories</label></div>
          <div className="units">
            <label>Units:</label>
            <div className="unit-buttons">
              <button className={units === "imperial" ? "on" : "off"} onClick={() => handleUnitsChange("imperial")}>
                standard
              </button>
              <button className={units === "metric" ? "on" : "off"} onClick={() => handleUnitsChange("metric")}>
                metric
              </button>
            </div>
          </div>
        </div>
        <ul className="attribute-tokens">
          {
            kAttrCategories.map((attrCategory: AttributeCategory) => (
              <li
                key={attrCategory}
                className={`token ${selectedAttrCategories.includes(attrCategory) ? "on" : "off"}`}
                onClick={() => handleTokenClick(attrCategory)}
              >
                { attrCategory }
              </li>
            ))
          }
        </ul>
        <hr className="light"/>
      </div>
      <div className="plugin-row data-buttons">
        <div className="app-message">
          {
            dataStatus === "retrieving" &&
            <div className="progress-indicator"><ProgressIndicator /> Retrieving data...</div>
          }
          {
            dataStatus === "retrieved" && <div className="done"><DoneIcon /> Retrieved data</div>
          }
          {
            dataStatus === "incomplete" && <div className="incomplete"><WarningIcon /> Some data requested are not available</div>
          }
          {
            dataStatus === "error" && <div className="error"><WarningIcon /> Error retrieving data</div>
          }
        </div>
        <div className="button-container">
          <button
            className="clear-data-button"
            disabled={!codapCases}
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
    </div>
  );
};
