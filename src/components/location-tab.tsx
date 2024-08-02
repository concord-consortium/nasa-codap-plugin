import React from "react";
import { getDayLightInfo } from "../utils/daylight-utils";
import { kDataContextName, kSelectableAttributes, kParentCollectionName, kChildCollectionName } from "../constants";
import { DaylightCalcOptions, ILocation } from "../types";
import { LocationPicker } from "./location-picker";

import {
  createDataContext,
  createItems,
  createParentCollection,
  getDataContext,
  codapInterface,
  createChildCollection,
  createTable
} from "@concord-consortium/codap-plugin-api";

//import "./LocationTab.scss";

interface LocationTabProps {
  latitude: string;
  longitude: string;
  location: ILocation | null;
  locationSearch: string;
  selectedAttrs: string[];
  dataContext: any; // TODO figure if we need this - not sure I am using it
  setLatitude: (latitude: string) => void;
  setLongitude: (longitude: string) => void;
  setLocation: (location: ILocation | null) => void;
  setLocationSearch: (search: string) => void;
  setSelectedAttributes: (attrs: string[]) => void;
  setDataContext: (context: any) => void; // TODO figure if we need this - not sure I am using it
}

export const LocationTab: React.FC<LocationTabProps> = ({
  latitude,
  longitude,
  location,
  locationSearch,
  selectedAttrs,
  dataContext,
  setLatitude,
  setLongitude,
  setLocation,
  setLocationSearch,
  setSelectedAttributes,
  setDataContext
}) => {
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

  const handleClearData = async () => {
    let result = await getDataContext(kDataContextName);
    if (result.success) {
      let dc = result.values;
      let lastCollection = dc.collections[dc.collections.length - 1];
      return await codapInterface.sendRequest({
        action: "delete",
        resource: `dataContext[${kDataContextName}].collection[${lastCollection.name}].allCases`
      });
    } else {
      return Promise.resolve({ success: true });
    }
  };

  const getDayLengthData = async () => {
    if (!latitude || !longitude) {
      alert("Please enter both latitude and longitude.");
      return;
    }

    let createDC;
    const calcOptions: DaylightCalcOptions = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      year: 2024,
      useRealTimeZones: true
    };

    const solarEvents = getDayLightInfo(calcOptions);
    const existingDataContext = await getDataContext(kDataContextName);

    if (!existingDataContext.success) {
      createDC = await createDataContext(kDataContextName);
      setDataContext(createDC.values);
    }

    if (existingDataContext?.success || createDC?.success) {
      await createParentCollection(kDataContextName, kParentCollectionName, [
        { name: "latitude", type: "numeric" },
        { name: "longitude", type: "numeric" },
        { name: "location", type: "categorical" }
      ]);
      await createChildCollection(kDataContextName, kChildCollectionName, kParentCollectionName, [
        { name: "day", type: "date" },
        { name: "sunrise", type: "date" },
        { name: "sunset", type: "date" },
        { name: "dayLength", type: "numeric" },
        { name: "dayAsInteger", type: "numeric" }
      ]);

      const completeSolarRecords = solarEvents.map(solarEvent => {
        const record: Record<string, any> = {
          latitude: Number(latitude),
          longitude: Number(longitude),
          location: location?.name,
          dayAsInteger: solarEvent.dayAsInteger
        };

        if (selectedAttrs.includes("day")) {
          record.day = solarEvent.day;
        }
        if (selectedAttrs.includes("sunrise")) {
          record.sunrise = solarEvent.sunrise;
        }
        if (selectedAttrs.includes("sunset")) {
          record.sunset = solarEvent.sunset;
        }
        if (selectedAttrs.includes("dayLength")) {
          record.dayLength = solarEvent.dayLength;
        }

        return record;
      });

      await createItems(kDataContextName, completeSolarRecords);
      await createTable(kDataContextName);
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
          {kSelectableAttributes.map((selectable: any, index: number) => (
            <li
              key={index}
              className={`token ${selectedAttrs.includes(selectable.attrName) ? "on" : "off"}`}
              onClick={() => handleTokenClick(selectable.attrName)}
            >
              {selectable.string}
            </li>
          ))}
        </ul>
      </div>
      <div className="plugin-row data-buttons">
        <button onClick={handleClearData} disabled={!dataContext}>
          Clear Data
        </button>
        <button onClick={getDayLengthData}>
          Get Data
        </button>
      </div>
    </div>
  );
};
