import React, { useState, useEffect, useRef, ChangeEvent, useCallback } from "react";
import ViewManager, { ViewManagerHandles } from "./view-manager";
import Slider from "./slider/slider";
import InfiniteDaySlider from "./slider/infinite-day-slider";
import CitySelect from "./city-select";
import getURLParam from "../utils/utils";
import t, { Language } from "../translation/translate";
import { ISimState, IViewState, ViewType } from "../types";
import { useAnimation } from "../hooks/use-animation";
import CCLogoImg from "../assets/concord-consortium.png";

import "./seasons.scss";

const ANIM_SPEED = 0.02;
const DAILY_ROTATION_ANIM_SPEED = 0.0003;
const ROTATION_SPEED = 0.0004;

const DEFAULT_SIM_STATE: ISimState = {
  day: 171,
  earthTilt: true,
  earthRotation: 1.539,
  sunEarthLine: true,
  lat: 40.11,
  long: -88.2,
  sunrayColor: "#D8D8AC",
  groundColor: "#4C7F19", // 'auto' will make color different for each season
  sunrayDistMarker: false,
  dailyRotation: false,
  earthGridlines: false,
  lang: "en_us"
};

const DEFAULT_VIEW_STATE: IViewState = {
  "main": "orbit",
  "small-top": "raysGround",
  "small-bottom": "nothing"
};

function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

interface IProps {
  lang?: Language;
  initialState?: Partial<ISimState>;
  log?: (action: string, data?: any) => void;
}

const Seasons: React.FC<IProps> = ({ lang = "en_us", initialState = {}, log = (action: string, data?: any) => {} }) => {
  const viewRef = useRef<ViewManagerHandles>(null);

  // State
  const [simState, setSimState] = useState<ISimState>({
    ...DEFAULT_SIM_STATE,
    ...initialState,
    lang: lang || (getURLParam("lang") as Language) || DEFAULT_SIM_STATE.lang
  });
  const [viewState, setViewState] = useState<IViewState>(DEFAULT_VIEW_STATE);

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

  // Rotation animation controlled by "Rotating" checkbox
  const { animationStarted: rotationAnimationStarted, toggleState: toggleRotationAnimation } = useAnimation({
    value: simState.earthRotation,
    setValue: (newAngle: number) => {
      if (!mainAnimationStarted) {
        setSimState(prevState => ({ ...prevState, earthRotation: newAngle % (2 * Math.PI) }));
      }
    },
    speed: ROTATION_SPEED
  });

  // Derived state
  const simLang = simState.lang;
  const earthVisible = Object.values(viewState).indexOf("earth") > -1;
  const playStopLabel = mainAnimationStarted ? t("~STOP", simLang) : t("~PLAY", simLang);

  // Log helpers
  const logCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    log(capitalize(event.target.name) + "CheckboxChanged", {
      value: event.target.checked
    });
  };

  const logButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    log(capitalize(event.currentTarget.name) + "ButtonClicked");
  };

  const lookAtSubsolarPoint = useCallback(() => {
    viewRef.current?.lookAtSubsolarPoint();
    setSimState(prevState => ({ ...prevState, earthRotation: (11.5 - simState.long) * Math.PI / 180 }));
  }, [simState.long]);

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
    const latitude = Math.abs(lat).toFixed(2);
    return `${latitude}°${dir}`;
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
  };

  const handleViewStateChange = (viewPosition: keyof IViewState, viewName: ViewType) => {
    const newViewState: Partial<IViewState> = {};
    newViewState[viewPosition] = viewName;
    if (viewName !== "nothing") {
      const oldView = viewState[viewPosition];
      for (const key in viewState) {
        if (viewState[key as keyof IViewState] === viewName) {
          newViewState[key as keyof IViewState] = oldView;
        }
      }
    }
    setViewState(prevState => ({ ...prevState, ...newViewState }));
    log("ViewsRearranged", viewState);
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
  };

  const handleLongSliderChange = (event: any, ui: any) => {
    setSimState(prevState => ({ ...prevState, long: ui.value }));
  };

  const handleCitySelectChange = (lat: number, long: number, city: string) => {
    const rot = -long * Math.PI / 180;
    setSimState(prevState => ({ ...prevState, lat, long, earthRotation: rot }));

    setTimeout(() => {
      viewRef.current?.lookAtLatLongMarker();
    }, 250);

    log("CityPulldownChanged", {
      value: city,
      lat,
      long
    });
  };

  const handleSubpolarButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    lookAtSubsolarPoint();
    logButtonClick(event);
  };

  return (
    <div className="grasp-seasons">
      <ViewManager
        ref={viewRef}
        view={viewState}
        simulation={simState}
        onSimStateChange={handleSimStateChange}
        onViewChange={handleViewStateChange}
        log={log}
      />
      <div className="controls">
        <div className="left-col">
          <div className="form-group">
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
            <label className="day">{ t("~DAY", simLang) }: { getFormattedDay() }</label>
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
          <div className="form-group pull-left">
            <CitySelect
              lat={simState.lat}
              long={simState.long}
              lang={simLang}
              onCityChange={handleCitySelectChange}
            />
            <div className="earth-gridlines-toggle"></div>
          </div>
        </div>
        <div className="right-col">
          <button className="btn btn-default" onClick={handleSubpolarButtonClick} name="ViewSubpolarPoint">
            { t("~VIEW_SUBSOLAR_POINT", simLang) }
          </button>
          <div className="long-lat-sliders">
            <div className="form-group">
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
            </div>
            <div className="form-group">
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
          <div className="checkboxes">
            <label>
              <input
                type="checkbox"
                name="EarthRotation"
                checked={rotationAnimationStarted}
                onChange={toggleRotationAnimation}
              />
              { t("~ROTATING", simLang) }
            </label>
            <label>
              <input
                type="checkbox"
                name="earthTilt"
                checked={simState.earthTilt}
                onChange={handleSimCheckboxChange}
              />
              { t("~TILTED", simLang) }
            </label>
            <label>
              <input
                type="checkbox"
                name="sunEarthLine"
                checked={simState.sunEarthLine}
                onChange={handleSimCheckboxChange}
              />
              { t("~SUN_EARTH_LINE", simLang) }
            </label>
            {
              earthVisible &&
              <label>
                <input
                  type="checkbox"
                  name="earthGridlines"
                  checked={simState.earthGridlines}
                  onChange={handleSimCheckboxChange}
                />
                { t("~EARTH_GRIDLINES", simLang) }
              </label>
            }
          </div>
        </div>
      </div>
      <footer className="page-footer">
        <section>
          <a
            className="cc-brand"
            href="http://concord.org/"
            target="_blank"
            title="The Concord Consortium - Revolutionary digital learning for science, math and engineering"
            rel="noreferrer"
          >
            <img src={CCLogoImg} alt="The Concord Consortium" />
          </a>
          <p>&copy; Copyright 2024 The Concord Consortium</p>
        </section>
      </footer>
    </div>
  );
};

export default Seasons;
