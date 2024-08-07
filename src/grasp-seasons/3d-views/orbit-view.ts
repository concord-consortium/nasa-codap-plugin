import * as THREE from "three";
import BaseView from "./base-view";
import EarthDraggingInteraction from "./orbit-view-interaction";
import LatitudeLine from "../3d-models/latitude-line";
import LatLongMarker from "../3d-models/lat-long-marker";
import models from "../3d-models/common-models";
import * as data from "../utils/solar-system-data";

const DEF_PROPERTIES = {
  day: 0,
  earthTilt: true,
  earthRotation: 4.94,
  sunEarthLine: true
};

const CAMERA_TWEEN_LENGTH = 1000;

// Cubic Bezier function
function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const oneMinusT = 1 - t;
  return Math.pow(oneMinusT, 3) * p0 +
         3 * Math.pow(oneMinusT, 2) * t * p1 +
         3 * oneMinusT * Math.pow(t, 2) * p2 +
         Math.pow(t, 3) * p3;
}

// Ease-in-out function
function easeInOut(t: number): number {
  const p0 = 0, p1 = 0.25, p2 = 0.75, p3 = 1;
  return cubicBezier(t, p0, p1, p2, p3);
}

export default class OrbitView extends BaseView {
  cameraSymbol!: THREE.Object3D;
  latLine!: LatitudeLine;
  latLongMarker!: LatLongMarker;
  monthLabels!: THREE.Object3D[];
  earthDraggingInteraction: EarthDraggingInteraction = new EarthDraggingInteraction(this);

  startingCameraPos?: THREE.Vector3;
  desiredCameraPos?: THREE.Vector3;
  startingCameraLookAt?: THREE.Vector3;
  desiredCameraLookAt?: THREE.Vector3;
  cameraSwitchTimestamp?: number;

  constructor(parentEl: HTMLElement, props = DEF_PROPERTIES) {
    super(parentEl, props, "orbit-view");
    this.registerInteractionHandler(this.earthDraggingInteraction);
  }

  setViewAxis(vec3: THREE.Vector3) {
    this.cameraSymbol.lookAt(vec3);
    this.cameraSymbol.rotateX(Math.PI * 0.5);
  }

  getCameraAngle() {
    const refVec = this.camera.position.clone().setY(0);
    let angle = this.camera.position.angleTo(refVec) * 180 / Math.PI;
    if (this.camera.position.y < 0) angle *= -1;
    return angle;
  }

  getEarthPosition() {
    const vector = this.earth.posObject.position.clone();

    const container = this.renderer.domElement;

    const widthHalf = (container.width/2);
    const heightHalf = (container.height/2);

    vector.project(this.camera);

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;
    vector.z = 0;

    return {
        x: Math.round(vector.x),
        y: Math.round(vector.y)
    };
  }

  getCloseUpCameraPosition() {
    const cameraOffset = new THREE.Vector3(0, 0, 40000000 / data.SCALE_FACTOR);
    return this.earth.posObject.position.clone().add(cameraOffset);
  }

  setupEarthCloseUpView() {
    this.registerInteractionHandler(null); // disable dragging interaction in close-up view
    this.sunEarthLine.rootObject.visible = false;
    this.monthLabels.forEach((label) => label.visible = false);
  }

  setupOrbitView() {
    this.registerInteractionHandler(this.earthDraggingInteraction);
    this.sunEarthLine.rootObject.visible = true;
    this.monthLabels.forEach((label) => label.visible = true);
  }

  render(timestamp: number) {
    super.render(timestamp);

    if (this.desiredCameraPos && this.startingCameraPos && this.desiredCameraLookAt && this.startingCameraLookAt &&
      this.cameraSwitchTimestamp !== undefined
    ) {
      const progress = Math.max(0, Math.min(1, (Date.now() - this.cameraSwitchTimestamp) / CAMERA_TWEEN_LENGTH));
      const progressEased = easeInOut(progress);

      this.camera.position.lerpVectors(this.startingCameraPos, this.desiredCameraPos, progressEased);
      this.controls.target.lerpVectors(this.startingCameraLookAt, this.desiredCameraLookAt, progressEased);
      if (progress === 1) {
        this.startingCameraPos = undefined;
        this.desiredCameraPos = undefined;
        this.startingCameraLookAt = undefined;
        this.desiredCameraLookAt = undefined;
        this.cameraSwitchTimestamp = undefined;
      }
    }
  }

  getInitialCameraPosition() {
    return new THREE.Vector3(0, 360000000 / data.SCALE_FACTOR, 0);
  }

  _setInitialCamPos() {
    this.camera.position.copy(this.getInitialCameraPosition());
  }

  toggleCameraModel(show: boolean) {
    this.earth.posObject.remove(this.cameraSymbol);
    if (show) {
      this.cameraSymbol = models.cameraSymbol();
    } else {
      this.cameraSymbol = models.hiddenCameraSymbol();
    }
    this.earth.posObject.add(this.cameraSymbol);
  }

  _updateLang() {
    for (let i = 0; i < this.monthLabels.length; i++){
      this.scene.remove(this.monthLabels[i]);
    }
    this._addLabels();
  }

  _updateShowCamera() {
    this.toggleCameraModel(this.props.showCamera ?? false);
  }

  _updateLat() {
    this.latLine.setLat(this.props.lat);
    this.latLongMarker.setLatLong(this.props.lat, this.props.long);
  }

  _updateLong() {
    this.latLongMarker.setLatLong(this.props.lat, this.props.long);
  }

  _updateEarthCloseUpView() {
    this.startingCameraPos = this.camera.position.clone();
    this.startingCameraLookAt = this.controls.target.clone();
    this.cameraSwitchTimestamp = Date.now();

    if (this.props.earthCloseUpView) {
      this.desiredCameraPos = this.getCloseUpCameraPosition();
      this.desiredCameraLookAt = this.earth.posObject.position.clone();
      this.setupEarthCloseUpView();
    } else {
      this.desiredCameraPos = this.getInitialCameraPosition();
      this.desiredCameraLookAt = new THREE.Vector3(0, 0, 0);
      this.setupOrbitView();
    }
  }

  _updateDay(): void {
    super._updateDay();
    if (this.props.earthCloseUpView) {
      if (this.desiredCameraPos && this.desiredCameraLookAt) {
        this.desiredCameraPos.copy(this.getCloseUpCameraPosition());
        this.desiredCameraLookAt.copy(this.earth.posObject.position);
      } else {
        this.camera.position.copy(this.getCloseUpCameraPosition());
        this.controls.target.copy(this.earth.posObject.position);
      }
    }
  }

  _initScene() {
    super._initScene();
    this.latLine = new LatitudeLine(false, true);
    this.latLongMarker = new LatLongMarker(true);
    this.earth.earthObject.add(this.latLine.rootObject);
    this.earth.earthObject.add(this.latLongMarker.rootObject);
    this.cameraSymbol = models.cameraSymbol();
    this.earth.posObject.add(this.cameraSymbol);
    this._addLabels();
  }

  _addLabels() {
    const months = this.months;
    const segments = months.length;
    const arc = 2 * Math.PI / segments;
    const labelRadius = data.EARTH_ORBITAL_RADIUS * 1.15;

    const monthLabels: THREE.Object3D[] = [];

    for (let i = 0; i < months.length; i++) {
      const monthLbl = models.label(months[i], months[i].length === 3);
      const angle = i * arc;
      monthLbl.position.x = labelRadius * Math.sin(angle);
      monthLbl.position.z = labelRadius * Math.cos(angle);
      monthLbl.rotateZ(angle);
      this.scene.add(monthLbl);
      monthLabels.push(monthLbl);
    }
    this.monthLabels = monthLabels;
  }
}
