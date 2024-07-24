import React, { useEffect, useState } from "react";
import { getDayLightInfo } from "../utils/daylight-utils";
import { kDataContextName, kInitialDimensions, kVersion, kPluginName } from "../constants";


import {
  createDataContext,
  createItems,
  createNewCollection,
  getDataContext,
  initializePlugin,
} from "@concord-consortium/codap-plugin-api";
import "./App.css";


export const App = () => {
  const [dataContext, setDataContext] = useState<any>(null);
  const [location, setLocation] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");

  useEffect(() => {
    initializePlugin({
      pluginName: kPluginName,
      version: kVersion,
      dimensions: kInitialDimensions
    });
  }, []);

  const handleLatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLatitude(event.target.value);
  };

  const handleLongChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLongitude(event.target.value);
  };

  const handleLocChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(event.target.value);
  };

  const getDayLengthData = async () => {
    let createDC;
    const dayLightInfoOptions = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      year: 2023
    };
    const solarEvents = getDayLightInfo(dayLightInfoOptions);
    const existingDataContext = await getDataContext(kDataContextName);

    if (!existingDataContext.success) {
      createDC = await createDataContext(kDataContextName);
      setDataContext(createDC.values);
    }

    if (existingDataContext?.success || createDC?.success) {
      await createNewCollection(kDataContextName, "Day Length", [
        { name: "day", type: "date" },
        { name: "sunrise", type: "date" },
        { name: "sunset", type: "date" },
        { name: "dayLength", type: "numeric" },
        { name: "dayAsInteger", type: "numeric" }
      ]);
      await createItems(kDataContextName, [...solarEvents]);
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
        <input
          type="text"
          placeholder="city, state or country"
          value={location}
          onChange={handleLocChange}
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

      <hr />
      <div className="plugin-row">
        Attributes
      </div>
      <div className="plugin-row">
        { /* placeholder */}
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
      </div>
      <div className="plugin-row">
        <em>
          Data context { dataContext ? <span>created</span> : <span>not created</span> }
        </em>
      </div>
    </div>
  );
};
