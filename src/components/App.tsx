import React, { useEffect, useState } from "react";
import {
  createDataContext,
  createItems,
  createNewCollection,
  getAllItems,
  getDataContext,
  initializePlugin,
} from "@concord-consortium/codap-plugin-api";
import "./App.css";

const kPluginName = "Day Length Plugin";
const kVersion = "0.0.1";
const kInitialDimensions = {
  width: 380,
  height: 680
};
const kDataContextName = "DayLength3PluginData";

export const App = () => {
  const [codapResponse, setCodapResponse] = useState<any>(undefined);
  const [location, setLocation] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");

  useEffect(() => {
    initializePlugin({ pluginName: kPluginName, version: kVersion, dimensions: kInitialDimensions });
  }, []);

  const handleCreateData = async () => {
    const existingDataContext = await getDataContext(kDataContextName);
    let createDC, createNC, createI;
    if (!existingDataContext.success) {
      createDC = await createDataContext(kDataContextName);
    }
    if (existingDataContext?.success || createDC?.success) {
      createNC = await createNewCollection(kDataContextName, "Pets", [
        { name: "animal", type: "categorical" },
        { name: "count", type: "numeric" }
      ]);
      createI = await createItems(kDataContextName, [
        { animal: "dog", count: 5 },
        { animal: "cat", count: 4 },
        { animal: "fish", count: 20 },
        { animal: "horse", count: 1 },
        { animal: "bird", count: 2 },
        { animal: "snake", count: 1 }
      ]);
    }

    setCodapResponse(`
      Data context created: ${JSON.stringify(createDC)}
      New collection created: ${JSON.stringify(createNC)}
      New items created: ${JSON.stringify(createI)}
    `);
  };

  const handleGetResponse = async () => {
    const result = await getAllItems(kDataContextName);
    setCodapResponse(result);
  };

  const handleLatitudeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("| lat change: ", event.target.value);
    setLatitude(event.target.value);
  };

  const handleLpngitudeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("| long change: ", event.target.value);
    setLongitude(event.target.value);
  };

  const handleLocChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("| loc change: ", event.target.value);
    setLocation(event.target.value);
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
          onChange={handleLatitudeChange}
        />
      </div>

      <div className="plugin-row">
        <label>Longitude:</label>
        <input
          type="text"
          placeholder="longitude"
          value={longitude}
          onChange={handleLpngitudeChange}
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
        <button>
          Get Data
        </button>
      </div>
      <div className="temporary">
        <div className="buttons">
          <button onClick={handleCreateData}>
            Create pets data
          </button>
          <button onClick={handleGetResponse}>
            See getAllItems response
          </button>
          <div className="response-area">
            <span>Response:</span>
            <div className="response">
              {codapResponse && `${JSON.stringify(codapResponse, null, "  ")}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
