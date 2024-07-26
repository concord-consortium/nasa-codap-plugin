import React, { useEffect, useState } from "react";
import { getDayLightInfo } from "../utils/daylight-utils";
import { kDataContextName, kInitialDimensions, kVersion, kSelectableAttributes,
  kPluginName, kParentCollectionName, kChildCollectionName } from "../constants";
import { LocationOptions, ILocation } from "../types";
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
import InfoIcon from "../assets/images/icon-info.svg";

import "./App.scss";

export const App = () => {
  const [dataContext, setDataContext] = useState<any>(null);
  const [location, setLocation] = useState<ILocation | null>(null);
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [selectedAttrs, setSelectedAttributes] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState<boolean>(false);

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

  const handleTokenClick = (attribute: string) => {
    if (selectedAttrs.includes(attribute)) {
      setSelectedAttributes(selectedAttrs.filter(attr => attr !== attribute));
    } else {
      setSelectedAttributes([...selectedAttrs, attribute]);
    }
  };

  const handleOpenInfo = () => {
    setShowInfo(!showInfo);
  };

  const getDayLengthData = async () => {
    if (!latitude || !longitude) {
      alert("Please enter both latitude and longitude.");
      return;
    }

    let createDC;
    const locationOptions: LocationOptions = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      year: 2024
    };

    const attrOptions = selectedAttrs.map(attr => {
      return kSelectableAttributes.find(selectable => selectable.attrName === attr);
    });
    console.log("| pass these attrs to the getDayLightInfo function: ", attrOptions);

    const solarEvents = getDayLightInfo(locationOptions);
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
          day: selectedAttrs.includes("day") ? solarEvent.day : null,
          sunrise: selectedAttrs.includes("sunrise") ? solarEvent.sunrise : null,
          sunset: selectedAttrs.includes("sunset") ? solarEvent.sunset : null,
          dayLength: selectedAttrs.includes("dayLength") ? solarEvent.dayLength : null,
          dayAsInteger: solarEvent.dayAsInteger
        };
      });

      await createItems(kDataContextName, completeSolarRecords);
    }
  };

  return (
    <div className="App">
      <div className="plugin-row top">
        <p>
          How long is a day?<br />
          Enter a location or coordinates to retrieve data
        </p>
        <span title="Get further information about this CODAP plugin">
          <InfoIcon className="info-icon" onClick={handleOpenInfo}/>
        </span>
      </div>
      <hr />

      <LocationPicker
        onLocationSelect={handleLocationSelect}
        searchValue={locationSearch}
        onSearchChange={handleLocationSearchChange}
      />
      {/* { location && <p>Selected Location: {location.name}</p> } */}

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
        {
          kSelectableAttributes.map((selectable, index) => (
            <li
              key={index}
              className={`token ${selectedAttrs.includes(selectable.attrName) ? "on" : "off"}`}
              onClick={() => handleTokenClick(selectable.attrName)}
            >
              {selectable.string}
            </li>
          ))
        }
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
