import * as THREE from "three";
import BaseInteraction, { IBaseView } from "./base-interaction";
import { earthEllipseLocationByDay } from "../utils/solar-system-data";
import Earth from "../3d-models/earth";

interface IOrbitView extends IBaseView {
  earth: Earth;
}

export default class extends BaseInteraction {
  _atan2Day0Pos: number;
  earth: Earth;
  constructor(view: IOrbitView) {
    super(view);

    this.earth = view.earth;
    const day0Pos = earthEllipseLocationByDay(0);
    // Base angle for further calculations in _getXZPlanPos.
    this._atan2Day0Pos = Math.atan2(day0Pos.z, day0Pos.x);

    this.registerInteraction({
      actionName: "EarthSphereDragged",
      test: () => {
        return !!this.isUserPointing(this.earth.earthObject);
      },
      setActive: (isActive: boolean) => {
        this.earth.setHighlighted(isActive);
        document.body.style.cursor = isActive ? "move" : "";
      },
      step: () => {
        const coords = this._getXZPlanPos();
        const angleDiff = this._atan2Day0Pos - Math.atan2(coords.z, coords.x);
        let newDay = angleDiff / (Math.PI * 2) * 364;
        if (newDay < 0) newDay += 364;
        this.dispatch.emit("props.change", { day: newDay });
        this.updateLogValue({ day: newDay });
      }
    });
  }

  // Projects mouse position on XZ plane.
  _getXZPlanPos() {
    const v = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
    v.unproject(this.camera);
    v.sub(this.camera.position);
    v.normalize();
    const distance = -this.camera.position.y / v.y;
    v.multiplyScalar(distance);
    const result = this.camera.position.clone();
    result.add(v);
    return result;
  }
}
