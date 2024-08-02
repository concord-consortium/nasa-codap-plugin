import React from "react";
import { useDataUtils } from "../hooks/useCodapData";
import { kSelectableAttributes } from "../constants";
import { ILocation } from "../types";
import { LocationPicker } from "./location-picker";

//import "./LocationTab.scss";

interface LocationTabProps {
  latitude: string;
  longitude: string;
  location: ILocation | null;
  locationSearch: string;
  selectedAttrs: string[];
  dataContext: any; // TODO the type
  setLatitude: (latitude: string) => void;
  setLongitude: (longitude: string) => void;
  setLocation: (location: ILocation | null) => void;
  setLocationSearch: (search: string) => void;
  setSelectedAttributes: (attrs: string[]) => void;
  setDataContext: (context: any) => void; // TODO the type
}

export const LocationTab: React.FC<LocationTabProps> = ({
  latitude,
  longitude,
  location,
  locationSearch,
  selectedAttrs,
  setLatitude,
  setLongitude,
  setLocation,
  setLocationSearch,
  setSelectedAttributes
}) => {
  const { dataContext, handleClearData: handleClearDataClick, getDayLengthData } = useDataUtils();

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

  const handleGetDetaClick = () => {
    getDayLengthData(Number(latitude), Number(longitude), location, selectedAttrs);
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
        <button onClick={handleClearDataClick} disabled={!dataContext}>
          Clear Data
        </button>
        <button onClick={handleGetDetaClick}>
          Get Data
        </button>
      </div>
    </div>
  );
};
