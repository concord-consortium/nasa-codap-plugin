import React, { useEffect, useState } from "react";
import { getDayLightInfo } from "../utils/daylight-utils";
import { kDataContextName, kInitialDimensions, kVersion, kPluginName, kParentCollectionName, kChildCollectionName } from "../constants";
import { DayLightInfoOptions, ILocation } from "../types";
import { LocationPicker } from "./location-picker";

import {
  createDataContext,
  createItems,
  createParentCollection,
  getDataContext,
  initializePlugin,
  codapInterface,
  createChildCollection
} from "@concord-consortium/codap-plugin-api";
import "./App.css";

export const App = () => {
  const [dataContext, setDataContext] = useState<any>(null);
  const [location, setLocation] = useState<ILocation | null>(null);
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [locationSearch, setLocationSearch] = useState<string>("");

  useEffect(() => {
    initializePlugin({
      pluginName: kPluginName,
      version: kVersion,
      dimensions: kInitialDimensions
    });
  }, []);

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
    const dayLightInfoOptions: DayLightInfoOptions = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      year: 2024
    };
    const solarEvents = getDayLightInfo(dayLightInfoOptions);
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
        return {
          latitude: Number(latitude),
          longitude: Number(longitude),
          location: location?.name,
          day: solarEvent.day,
          sunrise: solarEvent.sunrise,
          sunset: solarEvent.sunset,
          dayLength: solarEvent.dayLength,
          dayAsInteger: solarEvent.dayAsInteger
        };
      });

      await createItems(kDataContextName, completeSolarRecords);
    }
  };

  return (
    <div className="App">
      <div className="plugin-row">
        <p>
          How long is a day?<br />
          Enter a location or coordinates to retrieve data
        </p>
      </div>
      <hr />
      <div className="plugin-row">
        <label>Location:</label>
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          searchValue={locationSearch}
          onSearchChange={handleLocationSearchChange}
        />
      </div>

      <hr />
      <div className="plugin-row">
        <label>Latitude:</label>
        <input
          type="text"
          placeholder="latitude"
          value={latitude}
          onChange={handleLatChange}
        />
      </div>
      <div className="plugin-row">
        <label>Longitude:</label>
        <input
          type="text"
          placeholder="longitude"
          value={longitude}
          onChange={handleLongChange}
        />
      </div>

      {location && (
        <div className="plugin-row">
          <p>Selected Location: {location.name}</p>
        </div>
      )}

      <hr />
      <div className="plugin-row">
        Attributes
      </div>
      <div className="plugin-row">
        <ul className="attribute-tokens">
          <li>Day</li>
          <li>Day Length</li>
          <li>Rise Hour</li>
          <li>Set Hour</li>
          <li>Sunlight Angle</li>
          <li>Solar Intensity</li>
          <li>Surface Area</li>
          <li>Season</li>
        </ul>
      </div>
      <div className="plugin-row">
        <button onClick={getDayLengthData}>
          Get Data
        </button>
        <button onClick={handleClearData}>
          Clear Data
        </button>
      </div>

      <div className="plugin-row">
        <em>
          Data context {dataContext ? <span>created</span> : <span>not created</span>}
        </em>
      </div>
    </div>
  );
};
