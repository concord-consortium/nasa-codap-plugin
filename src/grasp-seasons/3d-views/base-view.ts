import $ from "jquery";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EventEmitter2 as EventEmitter, ListenerFn } from "eventemitter2";
import BaseInteraction from "./base-interaction";
import models from "../3d-models/common-models";
import Earth from "../3d-models/earth";
import SunEarthLine from "../3d-models/sun-earth-line";
import * as data from "../utils/solar-system-data";
import t, { Language } from "../translation/translate";
import { ISimState, ModelType } from "../types";
import EarthAxis from "../3d-models/earth-axis";

const DEF_PROPERTIES = {
  lang: "en_us",
  day: 0,
  earthTilt: true,
  earthRotation: 4.94,
  sunEarthLine: true
} as const;

export default class BaseView {
  _interactionHandler: BaseInteraction | null;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  dispatch: EventEmitter;
  earth!: Earth;
  earthAxis!: EarthAxis;
  lang: Language;
  months: string[];
  props: Partial<ISimState>;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  sunEarthLine!: SunEarthLine;
  type: ModelType;

  constructor(parentEl: HTMLElement, props: Partial<ISimState> = DEF_PROPERTIES, modelType: ModelType = "unknown") {
    const width = parentEl.clientWidth;
    const height = parentEl.clientHeight;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, data.EARTH_ORBITAL_RADIUS * 100);
    this.renderer = new THREE.WebGLRenderer({ antialias:true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setSize(width, height);
    parentEl.appendChild(this.renderer.domElement);

    this.lang = props.lang || "en_us";

    this.months = t("~MONTHS_MIXED", this.lang);

    // Type is passed to 3D models.
    this.type = modelType;
    this._initScene();
    this._setInitialCamPos();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.rotateSpeed = 0.5;
    // Very important: 0 degrees would place the camera in a position where it is impossible to determine
    // the desired direction of the camera tilt action.
    this.controls.minPolarAngle = THREE.MathUtils.degToRad(1);
    this.controls.maxPolarAngle = THREE.MathUtils.degToRad(179);

    this.dispatch = new EventEmitter();

    this.props = {};
    this.setProps(props);

    this._interactionHandler = null;

    // Emit events when camera is changed.
    this.controls.addEventListener("change", () => {
      this.dispatch.emit("camera.change");
    });
    this.controls.addEventListener("start", () => {
      this.dispatch.emit("camera.changeStart");
    });
    this.controls.addEventListener("end", () => {
      this.dispatch.emit("camera.changeEnd");
    });
  }

  setProps(newProps: Partial<ISimState>) {
    const oldProps = $.extend(this.props);
    this.props = $.extend(this.props, newProps);
    if (newProps.lang != null) {
      (this.lang = newProps.lang);
    }
    this.months = t("~MONTHS_MIXED", this.lang);
    let key: keyof ISimState;
    // Iterate over all the properties and call update handles for ones that have been changed.
    for (key in this.props) {
      if (this.props[key] !== oldProps[key]) {
        // Transform property name to name of the function that handles its update. For example:
        // earthTilt -> _updateEarthTilt.
        const funcName = `_update${key[0].toUpperCase()}${key.substr(1)}`;
        if (typeof (this as any)[funcName] === "function") {
          (this as any)[funcName]();
        }
      }
    }
  }

  lockCameraRotation(isLocked: boolean) {
    if (isLocked) {
      this.controls.rotateSpeed = 0;
    }
    else {
      this.controls.rotateSpeed = 0.5;
    }
  }

  // Delegate #on to EventEmitter object.
  on(event: string, listener: ListenerFn) {
    this.dispatch.on(event, listener);
  }

  // Rotates camera around the sun.
  rotateCam(angle: number) {
    this.camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    this.controls.update();
  }

  render(timestamp: number) {
    this.controls.update();
    if (this._interactionHandler) {
      this._interactionHandler.checkInteraction();
    }
    this.renderer.render(this.scene, this.camera);
  }

  // Resizes canvas to fill its parent.
  resize() {
    const $parent = $(this.renderer.domElement).parent();
    const newWidth = $parent.width();
    const newHeight = $parent.height();
    if (newWidth && newHeight) {
      this.camera.aspect = newWidth / newHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(newWidth, newHeight);
    }
  }

  registerInteractionHandler(handler: BaseInteraction | null) {
    this._interactionHandler = handler;
  }

  // Called automatically when 'day' property is updated.
  _updateDay() {
    if (this.props.day != null) {
      this.earth.setPositionFromDay(this.props.day);
    }
    this.sunEarthLine.setEarthPos(this.earth.position);
  }

  // Called automatically when 'earthTilt' property is updated.
  _updateEarthTilt() {
    this.earth.setTilted(this.props.earthTilt);
  }

  _updateEarthRotation() {
    if (this.props.earthRotation != null) {
      this.earth.rotation = this.props.earthRotation;
    }
  }

  _updateSunEarthLine() {
    const mesh = this.sunEarthLine.rootObject;
    if (this.props.sunEarthLine && !mesh.parent) {
      this.scene.add(mesh);
    } else if (!this.props.sunEarthLine && mesh.parent) {
      this.scene.remove(mesh);
    }
  }

  _updateLang() {
    this.lang = this.props.lang || "en_us";
  }

  _initScene() {
    const basicProps = { type: this.type };

    this.scene.add(models.stars(basicProps));
    this.scene.add(models.ambientLight(basicProps));
    this.scene.add(models.sunLight(basicProps));
    this.scene.add(models.sunOnlyLight(basicProps));
    this.scene.add(models.grid(basicProps));
    this.scene.add(models.orbit(basicProps));
    this.scene.add(models.sun(basicProps));

    this.earth = new Earth(basicProps);
    this.earthAxis = new EarthAxis();
    this.earth.earthObject.add(this.earthAxis.rootObject);
    this.scene.add(this.earth.rootObject);

    this.sunEarthLine = new SunEarthLine(basicProps);
    this.scene.add(this.sunEarthLine.rootObject);
  }

  _setInitialCamPos() {
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 0;
  }
}
