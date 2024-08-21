import * as THREE from "three";
import BaseView from "./base-view";
import EarthDraggingInteraction from "./orbit-view-interaction";
import LatLongMarkerDraggingInteraction from "./earth-view-interaction";
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

const CAMERA_TWEEN_LENGTH = 1500;

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
  latLogDraggingInteraction: LatLongMarkerDraggingInteraction = new LatLongMarkerDraggingInteraction(this);

  startingCameraPos?: THREE.Vector3;
  desiredCameraPos?: THREE.Vector3;
  startingCameraLookAt?: THREE.Vector3;
  desiredCameraLookAt?: THREE.Vector3;
  cameraSwitchTimestamp?: number;

  _suppressCameraChangeEvent = false;

  constructor(parentEl: HTMLElement, props = DEF_PROPERTIES) {
    super(parentEl, props, "orbit-view");
    this.registerInteractionHandler(this.earthDraggingInteraction);

    this.controls.addEventListener("change", () => {
      if (this._suppressCameraChangeEvent) {
        return;
      }
      this.dispatch.emit("props.change", { cameraTiltAngle: this.getCameraTiltAngle() });
    });
  }

  suppressCameraChangeEvent(callback: () => void) {
    this._suppressCameraChangeEvent = true;
    callback();
    this._suppressCameraChangeEvent = false;
  }

  setViewAxis(vec3: THREE.Vector3) {
    this.cameraSymbol.lookAt(vec3);
    this.cameraSymbol.rotateX(Math.PI * 0.5);
  }

  getCameraTiltAngle() {
    const targetPos = this.controls.target.clone();
    const refVec = this.camera.position.clone().sub(targetPos).setY(0);
    let angle = this.camera.position.clone().sub(targetPos).angleTo(refVec);
    if (this.camera.position.y < 0) angle *= -1;
    const angleInDeg = angle * 180 / Math.PI;
    return angleInDeg;
  }

  setCameraTiltAngle(angleInDeg: number) {
    const angleInRad = angleInDeg * Math.PI / 180;

    const targetPos = this.controls.target.clone();
    const cameraToTarget = this.camera.position.clone().sub(targetPos);
    const cameraToTargetLen = cameraToTarget.length();

    // Calculate reference vector with zero y-component
    const refVec = cameraToTarget.clone().setY(0);

    // Calculate the axis of rotation (cross product of the Y-axis and refVec)
    const axisOfRotation = new THREE.Vector3(0, 1, 0).cross(refVec).normalize();

    // Rotate the reference vector to achieve the desired tilt angle
    const newPos = refVec.applyAxisAngle(axisOfRotation, -angleInRad);

    // Set the length of the new position vector to the original distance from target
    newPos.setLength(cameraToTargetLen);

    // Translate the new position back to the world coordinates
    newPos.add(targetPos);

    // Update the camera's position
    this.camera.position.copy(newPos);
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
    const cameraOffset = new THREE.Vector3(0, 1000000 / data.SCALE_FACTOR, 40000000 / data.SCALE_FACTOR);
    return this.earth.posObject.position.clone().add(cameraOffset);
  }

  setupEarthCloseUpView() {
    this.registerInteractionHandler(this.latLogDraggingInteraction);
    this.monthLabels.forEach((label) => label.visible = false);
    this.sunEarthLine.setCloseUpStyle();
    this.earthAxis.setCloseUpStyle();
    this.latLongMarker.setCloseUpStyle();
  }

  setupOrbitView() {
    this.registerInteractionHandler(this.earthDraggingInteraction);
    this.sunEarthLine.rootObject.visible = true;
    this.monthLabels.forEach((label) => label.visible = true);
    this.sunEarthLine.setOrbitViewStyle();
    this.earthAxis.setOrbitViewStyle();
    this.latLongMarker.setOrbitViewStyle();
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
    return new THREE.Vector3(0, 440000000 / data.SCALE_FACTOR, 10);
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

  _updateCameraTiltAngle() {
    if (this.desiredCameraPos || this.desiredCameraLookAt) {
      // Do not try to update camera tilt angle while transitioning camera position
      return;
    }
    this.setCameraTiltAngle(this.props.cameraTiltAngle ?? 0);
  }

  _updateDay(): void {
    const oldEarthPosition = this.earth.posObject.position.clone();
    super._updateDay();
    if (this.props.earthCloseUpView) {
        const positionDiff = this.earth.posObject.position.clone().sub(oldEarthPosition);
        if (this.desiredCameraPos && this.desiredCameraLookAt) {
          this.desiredCameraPos.add(positionDiff);
          this.desiredCameraLookAt.add(positionDiff);
        } else {
          // It is necessary to suppress the camera change event to avoid conflicts with the camera position update
          // triggered by the tilt angle slider. This is acceptable, as the daily update will never change the camera
          // tilt angle.
          this.suppressCameraChangeEvent(() => {
            this.camera.position.add(positionDiff);
            this.controls.target.add(positionDiff);
            this.controls.update(); // Immediately flush the change event that will be suppressed.
          });
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
    const labelRadius = data.EARTH_ORBITAL_RADIUS * 1.22;

    const monthLabels: THREE.Object3D[] = [];

    for (let i = 0; i < months.length; i++) {
      const monthLbl = models.label(months[i], i % 3 !== 0);
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
