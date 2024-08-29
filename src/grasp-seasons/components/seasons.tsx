import React, { useState, useEffect, useRef, ChangeEvent, useCallback } from "react";
import Slider from "./slider/slider";
import {
  changeMonthOfDayOfYear, formatLatLongNumber, getSolarNoonIntensity, isValidLatitude, isValidLongitude,
  limitLatitude, limitLongitude
} from "../../utils/daylight-utils";
import InfiniteDaySlider from "./slider/infinite-day-slider";
import { Dropdown } from "../../components/dropdown";
import { Checkbox } from "../../components/checkbox";
import MyLocations from "./my-locations";
import getURLParam from "../utils/utils";
import OrbitViewComp from "./orbit-view-comp";
import RaysViewComp from "./rays-view-comp";
import { SquareButton } from "../../components/square-button";
import t, { Language } from "../translation/translate";
import { ISimState } from "../types";
import { useAnimation } from "../hooks/use-animation";
import { ILocation } from "../../types";

import ForwardBackIcon from "../../assets/images/forward-back-icon.svg";
import ForwardBackJumpIcon from "../../assets/images/forward-back-jump-icon.svg";
import PlayIcon from "../../assets/images/play-icon.svg";
import PauseIcon from "../../assets/images/pause-icon.svg";

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

interface IProps {
  lang?: Language;
  initialState?: Partial<ISimState>;
  log?: (action: string, data?: any) => void;

  locations: ILocation[];
  latitude: string;
  longitude: string;
  setLatitude: (latitude: string) => void;
  setLongitude: (longitude: string) => void;
  setLocationSearch: (name: string) => void;
  dayOfYear: number;
  setDayOfYear: (day: number) => void;
}

const Seasons: React.FC<IProps> = ({ lang = "en_us", initialState = {}, log = (action: string, data?: any) => {},
  locations, latitude, longitude, setLatitude, setLongitude, setLocationSearch, dayOfYear, setDayOfYear }) => {
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
      const day = newDay % 365;
      const stateUpdate: Partial<ISimState> = { day };
      if (simState.dailyRotation) {
        stateUpdate.earthRotation = (newDay % 1) * 2 * Math.PI;
      }
      setSimState(prevState => ({ ...prevState, ...stateUpdate }));
      setDayOfYear(day);
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

  useEffect(() => {
    setSimState(prevState => ({ ...prevState, day: dayOfYear }));
  }, [dayOfYear]);

  // Derived state
  const simLang = simState.lang;
  const playStopLabel = mainAnimationStarted ? t("~STOP", simLang) : t("~ORBIT_BUTTON", simLang);

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
    if (newState.day !== undefined) {
      setDayOfYear(newState.day);
    }
  };

  const handleDaySliderChange = (event: any, ui: any) => {
    setSimState(prevState => ({ ...prevState, day: ui.value }));
    setDayOfYear(ui.value);
  };

  const handleDayIncrement = (increment: number) => () => {
    setSimState(prevState => {
      // Make sure day is within [0, 364] range
      const day = (prevState.day + increment + 365) % 365;
      setDayOfYear(day);
      return { ...prevState, day };
    });
  };

  const handleMonthIncrement = (monthIncrement: number) => () => {
    setSimState(prevState => {
      const day = changeMonthOfDayOfYear(prevState.day, monthIncrement);
      setDayOfYear(day);
      return { ...prevState, day };
    });
  };

  const handleLatSliderChange = (event: any, ui: any) => {
    setSimState(prevState => ({ ...prevState, lat: ui.value }));
    setLatitude(formatLatLongNumber(ui.value));
    setLocationSearch("");
  };

  const handleLatInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLatitude(event.target.value);
    setLocationSearch("");
  }

  const handleLatIncrement = (increment: number) => () => {
    setSimState(prevState => ({ ...prevState, lat: limitLatitude(prevState.lat + increment) }));
    setLatitude(formatLatLongNumber(limitLatitude(simState.lat + increment)));
    setLocationSearch("");
  }

  const handleLongSliderChange = (event: any, ui: any) => {
    setSimState(prevState => ({ ...prevState, long: ui.value }));
    setLongitude(formatLatLongNumber(ui.value));
    setLocationSearch("");
  };

  const handleLongInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLongitude(event.target.value);
    setLocationSearch("");
  }

  const handleLongIncrement = (increment: number) => () => {
    setSimState(prevState => ({ ...prevState, long: limitLongitude(prevState.long + increment) }));
    setLongitude(formatLatLongNumber(limitLongitude(simState.long + increment)));
    setLocationSearch("");
  }

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

  const handleViewChange = (option: { name: string; value: string }) => {
    const earthCloseUpView = option.value === "true";
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
            <Dropdown<{ name: string, value: string }>
              inline={true}
              width="130px"
              label={t("~VIEW", simLang)}
              options={[
                { name: t("~EARTH_ORBIT", simLang), value: "false" },
                { name: t("~EARTH_CLOSE_UP", simLang), value: "true" }
              ]}
              value={simState.earthCloseUpView ? t("~EARTH_CLOSE_UP", simLang) : t("~EARTH_ORBIT", simLang)}
              onSelect={handleViewChange}
            />
          </div>
          <div className="playback-controls">
            <div className="orbit-button-bg">
              <button
                className="orbit-button"
                name={playStopLabel}
                onClick={toggleMainAnimation}
              >
                { mainAnimationStarted ? <PauseIcon /> : <PlayIcon /> }
                { playStopLabel }
              </button>
            </div>
            <Checkbox
              checked={simState.dailyRotation}
              onChange={checked => setSimState(prevState => ({ ...prevState, dailyRotation: checked }))}
              label={t("~DAILY_ROTATION", simLang)}
              disabled={!mainAnimationStarted}
            />
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
        <div className="day-row">
          <SquareButton onClick={handleMonthIncrement(-1)}><ForwardBackJumpIcon /></SquareButton>
          <SquareButton onClick={handleDayIncrement(-1)}><ForwardBackIcon /></SquareButton>
          <div className="day">
            <label>{ t("~DAY", simLang) }:</label>
            { getFormattedDay() }
          </div>
          <SquareButton onClick={handleDayIncrement(1)}><ForwardBackIcon style={{ transform: "rotate(180deg" }} /></SquareButton>
          <SquareButton onClick={handleMonthIncrement(1)}><ForwardBackJumpIcon style={{ transform: "rotate(180deg" }} /></SquareButton>
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
          <div className="solar-intensity-value-and-unit">
            <div className="solar-intensity-value">{ solarIntensityValue }</div>
            { t("~SOLAR_INTENSITY_UNIT", simLang) }
          </div>
        </div>
        <MyLocations
          lat={simState.lat}
          long={simState.long}
          lang={simLang}
          locations={locations}
          onLocationChange={handleMyLocationChange}
        />
        <div className="long-lat-sliders">
          <div className="slider-container">
            <div className="top-row">
              <SquareButton onClick={handleLatIncrement(-5)} disabled={simState.lat <= -90}><ForwardBackIcon /></SquareButton>
              <label>{ t("~LATITUDE", simLang) }</label>
              <input className="lat-input" type="text" value={latitude} onChange={handleLatInputChange} />
              <SquareButton onClick={handleLatIncrement(5)} disabled={simState.lat >= 90}><ForwardBackIcon style={{ transform: "rotate(180deg" }}/></SquareButton>
            </div>
          <Slider
            value={simState.lat}
            min={-90}
            max={90}
            step={1}
            slide={handleLatSliderChange}
            log={log}
            logId="Latitude"
          />
          </div>
          <div className="slider-container">
            <div className="top-row">
              <SquareButton onClick={handleLongIncrement(-5)} disabled={simState.long <= -180}><ForwardBackIcon /></SquareButton>
              <label>{ t("~LONGITUDE", simLang) }</label>
              <input className="long-input" type="text" value={longitude} onChange={handleLongInputChange} />
              <SquareButton onClick={handleLongIncrement(5)} disabled={simState.long >= 180}><ForwardBackIcon style={{ transform: "rotate(180deg" }}/></SquareButton>
            </div>
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
    </div>
  );
};

export default Seasons;
