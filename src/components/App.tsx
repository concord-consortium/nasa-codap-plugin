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

  useEffect(() => {
    initializePlugin({pluginName: kPluginName, version: kVersion, dimensions: kInitialDimensions});
  }, []);

  const handleCreateData = async() => {
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

  return (
    <div className="App">
      CODAP Day Length Plugin 3
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
  );
};
