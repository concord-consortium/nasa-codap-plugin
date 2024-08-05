import React, { useEffect, useRef, useImperativeHandle, forwardRef, ChangeEvent, useCallback } from "react";
import EarthViewComp from "./earth-view-comp";
import OrbitViewComp from "./orbit-view-comp";
import RaysViewComp from "./rays-view-comp";
import t from "../translation/translate";
import { ISimState, IViewState, ViewType } from "../types";

import "./view-manager.scss";

export interface ViewManagerHandles {
  lookAtSubsolarPoint: () => void;
  lookAtLatLongMarker: () => void;
}

interface IProps {
  simulation: ISimState;
  view: IViewState;
  log: (action: string, data: any) => void;
  onSimStateChange: (change: Partial<ISimState>) => void;
  onViewChange: (viewPosition: keyof IViewState, viewName: ViewType) => void;
}

const ViewManager = forwardRef<ViewManagerHandles, IProps>(({
  simulation, view, log, onSimStateChange, onViewChange
}, ref) => {
  const lang = simulation.lang;

  const earthRef = useRef<EarthViewComp>(null);
  const orbitRef = useRef<OrbitViewComp>(null);
  const raysGroundRef = useRef<RaysViewComp>(null);
  const raysSpaceRef = useRef<RaysViewComp>(null);

  const rafId = useRef<number | undefined>(undefined);

  const rafCallback = useCallback((timestamp: number) => {
    earthRef.current?.rafCallback(timestamp);
    orbitRef.current?.rafCallback(timestamp);
    rafId.current = requestAnimationFrame(rafCallback);
  }, []);

  // When earth view camera is changed, we need to update view axis in the orbit view.
  const syncCameraAndViewAxis = () => {
    if (earthRef.current && orbitRef.current) {
      const camVec = earthRef.current.getCameraEarthVec();
      orbitRef.current.setViewAxis(camVec);
    }
  };

  const handleViewChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onViewChange(event.target.name as keyof IViewState, event.target.value as ViewType);
  };

  const showOrbitViewCameraModel = () => {
    // Hiding camera model for now, retaining functionality for future.
    // If Earth is visible in another view, Orbit view will show camera model
    // return (Object.values(this.props.view)).indexOf("earth") > -1;
    return false;
  };

  const getViewPosition = (_view: ViewType) => {
    let key: keyof IViewState;
    for (key in view) {
      if (view[key] === _view) return key;
    }
    return "hidden";
  };

  useEffect(() => {
    rafId.current = requestAnimationFrame(rafCallback);
    orbitRef.current?.toggleCameraModel(showOrbitViewCameraModel());
    syncCameraAndViewAxis();

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [rafCallback]);

  useEffect(() => {
    earthRef.current?.resize();
    orbitRef.current?.resize();
    raysGroundRef.current?.resize();
    raysSpaceRef.current?.resize();

    orbitRef.current?.toggleCameraModel(showOrbitViewCameraModel());

    if (showOrbitViewCameraModel()) {
      syncCameraAndViewAxis();
    }
  }, [view]);

  useEffect(() => {
    earthRef.current?.toggleGridlines(simulation.earthGridlines);
  }, [simulation.earthGridlines]);

  useImperativeHandle(ref, () => ({
    lookAtSubsolarPoint: () => {
      earthRef.current?.lookAtSubsolarPoint();
    },
    lookAtLatLongMarker: () => {
      earthRef.current?.lookAtLatLongMarker();
    }
  }));

  const renderViewSelect = (position: keyof IViewState) => {
    return (
      <select className={`form-control view-select ${position}`} name={position}
        value={view[position]} onChange={handleViewChange}>
        <option value="earth">{ t("~EARTH", lang) }</option>
        <option value="orbit">{ t("~ORBIT", lang) }</option>
        <option value="raysGround">{ t("~GROUND", lang) }</option>
        <option value="raysSpace">{ t("~SPACE", lang) }</option>
        <option value="nothing">{ t("~NOTHING", lang) }</option>
      </select>
    );
  };

  return (
    <div className="view-manager">
      <div className={`view ${getViewPosition("earth")}`}>
        <EarthViewComp
          ref={earthRef} simulation={simulation} onSimStateChange={onSimStateChange}
          onCameraChange={syncCameraAndViewAxis} log={log}
        />
      </div>
      <div className={`view ${getViewPosition("orbit")}`}>
        <OrbitViewComp
          ref={orbitRef} simulation={simulation} onSimStateChange={onSimStateChange}
          log={log} showCamera={showOrbitViewCameraModel()}
        />
      </div>
      <div className={`view ${getViewPosition("raysGround")}`}>
        <div className="rays-ground-text">{ t("~NOON", lang) }</div>
        <RaysViewComp
          ref={raysGroundRef} type="ground" simulation={simulation}
          onSimStateChange={onSimStateChange}
        />
      </div>
      <div className={`view ${getViewPosition("raysSpace")}`}>
        <RaysViewComp
          ref={raysSpaceRef} type="space" simulation={simulation}
          onSimStateChange={onSimStateChange}
        />
      </div>
      { renderViewSelect("main") }
      { renderViewSelect("small-top") }
      { renderViewSelect("small-bottom") }
    </div>
  );
});

ViewManager.displayName = "ViewManager";
export default ViewManager;
