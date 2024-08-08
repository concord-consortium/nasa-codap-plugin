import React, { useState, useEffect, useRef, ChangeEvent, useCallback } from "react";
import Slider from "./slider/slider";
import { getSolarNoonIntensity, isValidLatitude, isValidLongitude } from "../../utils/daylight-utils";
import InfiniteDaySlider from "./slider/infinite-day-slider";
import MyLocations from "./my-locations";
import getURLParam from "../utils/utils";
import OrbitViewComp from "./orbit-view-comp";
import RaysViewComp from "./rays-view-comp";
import t, { Language } from "../translation/translate";
import { ISimState } from "../types";
import { useAnimation } from "../hooks/use-animation";
import { ILocation } from "../../types";

import "./seasons.scss";

const ANIM_SPEED = 0.02;
const DAILY_ROTATION_ANIM_SPEED = 0.0003;

const DEFAULT_SIM_STATE: ISimState = {
  day: 171,
  earthTilt: true,
  earthRotation: 1.539,
  sunEarthLine: true,
  lat: 0,
  long: 0,
  sunrayColor: "#D8D8AC",
  groundColor: "#4C7F19", // 'auto' will make color different for each season
  sunrayDistMarker: false,
  dailyRotation: false,
  earthGridlines: false,
  lang: "en_us",
  // -- Day Length Plugin extra state ---
  // It could be ported back to GRASP Seasons too to handle camera model cleaner way.
  showCamera: false,
  // A new type of view where the camera is locked on Earth. It is different from GRASP Seasons Earth View because the
  // camera follows Earth's position but does not rotate. As the year passes, we'll see different parts of Earth,
  // including its night side. This is useful for keeping the Earth's axis constant.
  earthCloseUpView: false,
  cameraTiltAngle: 89
};

function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatLatLongNumber(value: number) {
  return value.toFixed(5);
}

interface IProps {
  lang?: Language;
  initialState?: Partial<ISimState>;
  log?: (action: string, data?: any) => void;

  latitude: string;
  longitude: string;
  locations: ILocation[];
  setLatitude: (latitude: string) => void;
  setLongitude: (longitude: string) => void;
  setLocationSearch: (name: string) => void;
}

const Seasons: React.FC<IProps> = ({ lang = "en_us", initialState = {}, log = (action: string, data?: any) => {},
  latitude, longitude, locations, setLatitude, setLongitude, setLocationSearch }) => {
  const orbitViewRef = useRef<OrbitViewComp>(null);

  // State
  const [simState, setSimState] = useState<ISimState>({
    ...DEFAULT_SIM_STATE,
    ...initialState,
    lang: lang || (getURLParam("lang") as Language) || DEFAULT_SIM_STATE.lang
  });

  // Earth rotation animation controlled by "Play" button
  const { animationStarted: mainAnimationStarted, toggleState: toggleMainAnimation } = useAnimation({
    value: simState.day,
    setValue: (newDay: number) => {
      const stateUpdate: Partial<ISimState> = { day: newDay % 365 };
      if (simState.dailyRotation) {
        stateUpdate.earthRotation = (newDay % 1) * 2 * Math.PI;
      }
      setSimState(prevState => ({ ...prevState, ...stateUpdate }));
    },
    speed: simState.dailyRotation ? DAILY_ROTATION_ANIM_SPEED : ANIM_SPEED
  });

  // Main animation loop
  const rafId = useRef<number | undefined>(undefined);

  const rafCallback = useCallback((timestamp: number) => {
    orbitViewRef.current?.rafCallback(timestamp);
    rafId.current = requestAnimationFrame(rafCallback);
  }, []);

  useEffect(() => {
    requestAnimationFrame(rafCallback);
    return () => {
      if (rafId.current !== undefined) {
        cancelAnimationFrame(rafId.current);
      }
    }
  }, [rafCallback]);

  // Handle props coming from the parent and update local state accordingly
  useEffect(() => {
    if (isValidLatitude(latitude)) {
      setSimState(prevState => ({ ...prevState, lat: Number(latitude) }));
    }
  }, [latitude]);

  useEffect(() => {
    if (isValidLongitude(longitude)) {
      setSimState(prevState => ({ ...prevState, long: Number(longitude) }));
    }
  }, [longitude]);

  // Derived state
  const simLang = simState.lang;
  const playStopLabel = mainAnimationStarted ? t("~STOP", simLang) : t("~ORBIT_BUTTON", simLang);

  // Log helpers
  const logCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    log(capitalize(event.target.name) + "CheckboxChanged", {
      value: event.target.checked
    });
  };

  // Keep updating lang in simState when lang prop changes
  useEffect(() => {
    setSimState(prevState => ({ ...prevState, lang }));
  }, [lang]);

  // Helper functions
  const getMonth = (date: Date) => {
    const monthNames = t("~MONTHS", simLang);
    return monthNames[date.getMonth()];
  };

  const getFormattedDay = () => {
    const date = new Date(2024, 0);
    date.setDate(simState.day + 1);
    return `${getMonth(date)} ${date.getDate()}`;
  };

  const getFormattedLat = () => {
    let dir = "";
    const lat = simState.lat;
    if (lat > 0) dir = t("~DIR_NORTH", simLang);
    else if (lat < 0) dir = t("~DIR_SOUTH", simLang);
    const _latitude = Math.abs(lat).toFixed(2);
    return `${_latitude}°${dir}`;
  };

  const getFormattedLong = () => {
    let dir = "";
    const lng = simState.long;
    if (lng > 0) dir = t("~DIR_EAST", simLang);
    else if (lng < 0) dir = t("~DIR_WEST", simLang);
    const long = Math.abs(lng).toFixed(2);
    return `${long}°${dir}`;
  };

  // Event handlers
  const handleSimStateChange = (newState: Partial<ISimState>) => {
    setSimState(prevState => ({ ...prevState, ...newState }));
    // Latitude and longitude can be changed when user drags the Earth in the Orbit view
    if (newState.lat !== undefined) {
      setLatitude(formatLatLongNumber(newState.lat));
      setLocationSearch("");
    }
    if (newState.long !== undefined) {
      setLongitude(formatLatLongNumber(newState.long));
      setLocationSearch("");
    }
  };

  const handleDaySliderChange = (event: any, ui: any) => {
    setSimState(prevState => ({ ...prevState, day: ui.value }));
  };

  const handleSimCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSimState(prevState => ({ ...prevState, [event.target.name as any as keyof ISimState]: event.target.checked }));
    logCheckboxChange(event);
  };

  const handleLatSliderChange = (event: any, ui: any) => {
    setSimState(prevState => ({ ...prevState, lat: ui.value }));
    setLatitude(formatLatLongNumber(ui.value));
    setLocationSearch("");
  };

  const handleLongSliderChange = (event: any, ui: any) => {
    setSimState(prevState => ({ ...prevState, long: ui.value }));
    setLongitude(formatLatLongNumber(ui.value));
    setLocationSearch("");
  };

  const handleTiltSliderChange = (event: any, ui: any) => {
    setSimState(prevState => ({ ...prevState, cameraTiltAngle: ui.value }));
  };

  const handleMyLocationChange = (lat: number, long: number, name: string) => {
    const rot = -long * Math.PI / 180;
    setSimState(prevState => ({ ...prevState, lat, long, earthRotation: rot }));
    setLatitude(formatLatLongNumber(lat));
    setLongitude(formatLatLongNumber(long));
    setLocationSearch(name);
  };

  const handleViewChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const earthCloseUpView = event.target.value === "true";
    setSimState(prevState => ({ ...prevState, earthCloseUpView }));
  }

  const solarIntensityValue = getSolarNoonIntensity(simState.day, simState.lat).toFixed(2);

  return (
    <div className="grasp-seasons">
      <div className="left-col">
        <div className="main-view">
          <OrbitViewComp
            ref={orbitViewRef} simulation={simState} onSimStateChange={handleSimStateChange} log={log} showCamera={false}
          />
          <div className="view-type-dropdown">
            <label>{ t("~VIEW", simLang) }
              <select value={simState.earthCloseUpView.toString()} onChange={handleViewChange}>
                <option value="false">{ t("~EARTH_ORBIT", simLang) }</option>
                <option value="true">{ t("~EARTH_CLOSE_UP", simLang) }</option>
              </select>
            </label>
          </div>
          <div className="playback-controls">
            <button
              className="btn btn-default animation-btn"
              name={playStopLabel}
              onClick={toggleMainAnimation}
            >
              { playStopLabel }
            </button>
            <label>
              <input
                type="checkbox"
                name="dailyRotation"
                checked={simState.dailyRotation}
                onChange={handleSimCheckboxChange}
              />
              { t("~DAILY_ROTATION", simLang) }
            </label>
          </div>
          <div className="tilt-slider">
            <label>{ t("~TILT_VIEW", simLang) }</label>
            <div className="slider-container">
              <Slider
                orientation="vertical"
                value={simState.cameraTiltAngle}
                min={0}
                // Very important: 90 degrees would place the camera in a position where it is impossible to determine
                // the desired direction of the camera tilt action.
                max={89}
                step={1}
                slide={handleTiltSliderChange}
                log={log}
                logId="Tilt"
              />
            </div>
          </div>
        </div>
        <div className="day">
          <label>{ t("~DAY", simLang) }:</label>
          { getFormattedDay() }
        </div>
        <div className="day-slider">
          <InfiniteDaySlider
            value={simState.day}
            slide={handleDaySliderChange}
            lang={simLang}
            log={log}
            logId="Day"
          />
        </div>
      </div>
      <div className="right-col">
        <div className="ground-view-label">{ t("~GROUND_VIEW", simLang) }</div>
        <div className="ground-view">
          <RaysViewComp type="ground" simulation={simState} onSimStateChange={handleSimStateChange} />
        </div>
        <div className="sunlight-at-noon">{ t("~SUNLIGHT_AT_NOON", simLang) }</div>
        <div className="solar-intensity">
          <label>{ t("~SOLAR_INTENSITY", simLang) }: </label>
          { solarIntensityValue } { t("~SOLAR_INTENSITY_UNIT", simLang) }
        </div>
        <MyLocations
          lat={simState.lat}
          long={simState.long}
          lang={simLang}
          locations={locations}
          onLocationChange={handleMyLocationChange}
        />
        <div className="long-lat-sliders">
          <label>{ t("~LATITUDE", simLang) }: { getFormattedLat() }</label>
          <Slider
            value={simState.lat}
            min={-90}
            max={90}
            step={1}
            slide={handleLatSliderChange}
            log={log}
            logId="Latitude"
          />
          <label>{ t("~LONGITUDE", simLang) }: { getFormattedLong() }</label>
          <Slider
            value={simState.long}
            min={-180}
            max={180}
            step={1}
            slide={handleLongSliderChange}
            log={log}
            logId="Longitude"
          />
        </div>
      </div>
    </div>
  );
};

export default Seasons;
