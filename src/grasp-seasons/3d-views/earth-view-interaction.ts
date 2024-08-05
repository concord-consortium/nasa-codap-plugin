import * as THREE from "three";
import Earth from "../3d-models/earth";
import LatLongMarker from "../3d-models/lat-long-marker";
import LatitudeLine from "../3d-models/latitude-line";
import BaseInteraction, { IBaseView } from "./base-interaction";

const RAD_2_DEG = 180 / Math.PI;

interface IEarthView extends IBaseView{
  earth: Earth;
  latLongMarker: LatLongMarker;
  latLine: LatitudeLine;
}

export default class extends BaseInteraction {
  earth: Earth;
  latLine: LatitudeLine;
  latLongMarker: LatLongMarker;
  constructor(view: IEarthView) {
    super(view);

    this.latLongMarker = view.latLongMarker;
    this.latLine = view.latLine;
    this.earth = view.earth;

    this.registerInteraction({
      actionName: "LatLngMarkerDragged",
      test: () => {
        return !!this.isUserPointing(this.latLongMarker.mesh);
      },
      setActive: (isActive: boolean) => {
        this.latLongMarker.setHighlighted(isActive);
        document.body.style.cursor = isActive ? "move" : "";
      },
      step: () => {
        const coords = this._getPointerLatLong();
        if (coords != null) {
          // coords can be equal to null if user isn't pointing earth anymore.
          this.dispatch.emit("props.change", { lat: coords.lat, long: coords.long });
          this.updateLogValue(coords);
        }
      }
    });
    this.registerInteraction({
      actionName: "LatLineDragged",
      test: () => {
        return !!this.isUserPointing(this.latLine.mesh);
      },
      setActive: (isActive: boolean) => {
        this.latLine.setHighlighted(isActive);
        this.latLongMarker.setHighlighted(isActive);
        document.body.style.cursor = isActive ? "move" : "";
      },
      step: () => {
        const coords = this._getPointerLatLong();
        if (coords != null) {
          // coords can be equal to null if user isn't pointing earth anymore.
          this.dispatch.emit("props.change", { lat: coords.lat });
          this.updateLogValue(coords);
        }
      }
    });
  }

  _getPointerLatLong() {
    const intersects = this.isUserPointing(this.earth.earthObject);
    if (!intersects) {
      // Pointer does not intersect with earth, return null.
      return null;
    }
    // Calculate vector pointing from Earth center to intersection point.
    const intVec = intersects[0].point;
    intVec.sub(this.earth.position);
    // Take into account earth tilt and rotation. Note that order of these operations is important!
    intVec.applyAxisAngle(this.earth.verticalAxisDir, -this.earth.overallRotation);
    intVec.applyAxisAngle(this.earth.horizontalAxisDir, -this.earth.tilt);

    // Latitude calculations.
    const xzVec = new THREE.Vector3(intVec.x, 0, intVec.z);
    let lat = intVec.angleTo(xzVec) * RAD_2_DEG;
    // .angleTo returns always positive number.
    if (intVec.y < 0) lat *= -1;
    // Longitude calculations.
    let long = this.earth.lat0Long0AxisDir.angleTo(xzVec) * RAD_2_DEG;
    if (intVec.z > 0) long *= -1;
    return { lat, long };
  }
}
