import * as THREE from "three";
import BaseView from "./base-view";
import LatitudeLine from "../3d-models/latitude-line";
import LatLongMarker from "../3d-models/lat-long-marker";
import LatLongDraggingInteraction from "./earth-view-interaction";
import * as data from "../utils/solar-system-data";

const DEG_2_RAD = Math.PI / 180;

const DEF_PROPERTIES = {
  day: 0,
  earthTilt: true,
  sunEarthLine: true,
  earthRotation: 4.94,
  lat: 0,
  long: 0
};

export default class EarthView extends BaseView {
  equatorLine!: LatitudeLine;
  latLine!: LatitudeLine;
  latLongMarker!: LatLongMarker;
  constructor(parentEl: HTMLElement, props = DEF_PROPERTIES) {
    super(parentEl, props, "earth-view");
    this.registerInteractionHandler(new LatLongDraggingInteraction(this));
  }

  // Normalized vector pointing from camera to earth.
  getCameraEarthVec() {
    return this.camera.position.clone().sub(this.earth.position).normalize();
  }

  lookAtSubsolarPoint() {
    const earthPos = this.earth.position;
    const camEarthDist = this.camera.position.distanceTo(earthPos);
    const earthSunDist = earthPos.length();
    this.camera.position.copy(earthPos);
    this.camera.position.multiplyScalar((earthSunDist - camEarthDist) / earthSunDist);
    this.controls.update();
  }

  lookAtLatLongMarker() {
    // First, create vector pointing at lat 0, long 0.
    const markerVec = this.earth.lat0Long0AxisDir;
    // Apply latitude.
    markerVec.applyAxisAngle(this.earth.horizontalAxisDir, this.props.lat! * DEG_2_RAD + this.earth.tilt);
    // Apply longitude.
    markerVec.applyAxisAngle(this.earth.verticalAxisDir, this.props.long! * DEG_2_RAD + this.earth.overallRotation);
    markerVec.normalize();
    // Calculate quaternion that would be applied to camera position vector.
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(this.getCameraEarthVec(), markerVec);
    // Note that cameraVec is normalized, the one below is not.
    const newCameraPos = this.camera.position.clone().sub(this.earth.position);
    newCameraPos.applyQuaternion(quaternion);
    newCameraPos.add(this.earth.position);
    // Update position and orbit controls.
    this.camera.position.copy(newCameraPos);
    this.controls.update();
  }

  toggleGridlines(gridlines: boolean) {
    this.earth.showGridlines(gridlines);
  }

  _updateDay() {
    const oldOrbitRot = this.earth.orbitRotation;
    const oldPos = this.earth.position.clone();
    super._updateDay();
    const newOrbitRot = this.earth.orbitRotation;
    const newPos = this.earth.position.clone();

    // Update camera position, rotate it and adjust its orbit length.
    this.rotateCam(newOrbitRot - oldOrbitRot);
    const lenRatio = newPos.length() / oldPos.length();
    this.camera.position.x *= lenRatio;
    this.camera.position.z *= lenRatio;
    // Set orbit controls target to new position too.
    this.controls.target.copy(newPos);
    // Make sure that this call is at the very end, as otherwise 'camera.change' event can be fired before
    // earth position is updated. This causes problems when client code tries to call .getCameraEarthVec()
    // in handler (as earth position is still outdated).
    this.controls.update();
  }

  _updateLat() {
    this.latLine.setLat(this.props.lat);
    this.latLongMarker.setLatLong(this.props.lat, this.props.long);
  }

  _updateLong() {
    this.latLongMarker.setLatLong(this.props.lat, this.props.long);
  }

  _initScene() {
    super._initScene();
    this.latLine = new LatitudeLine();
    this.latLongMarker = new LatLongMarker();
    this.earth.earthObject.add(this.latLine.rootObject);
    this.earth.earthObject.add(this.latLongMarker.rootObject);
    this.equatorLine = new LatitudeLine(true);
    this.equatorLine.setLat(0);
    (this.equatorLine as any).name = "equator";
    this.earth.earthObject.add(this.equatorLine.rootObject);
  }

  _setInitialCamPos() {
    // Sets camera next to earth at day 0 position to set initial distance from earth.
    this.camera.position.x = -129000000 / data.SCALE_FACTOR;
    this.camera.position.y = 5000000 / data.SCALE_FACTOR;
    this.camera.position.z = 25000000 / data.SCALE_FACTOR;
  }
}
