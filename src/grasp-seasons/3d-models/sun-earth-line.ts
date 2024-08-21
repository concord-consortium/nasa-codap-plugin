import * as THREE from "three";
import { IModelParams } from "../types";
import * as c from "./constants";

const HEIGHT = 1; // arrow will be rescaled dynamically based on earth-sun distance that changes through the year
const RADIUS = 1500000 * c.SF;
const LARGE_HEAD_RADIUS = RADIUS * 7;
const LARGE_HEAD_HEIGHT = HEIGHT * 0.2;
const SMALL_HEAD_RADIUS = RADIUS * 5;
const SMALL_HEAD_HEIGHT = HEIGHT * 0.03;
const SMALL_ARROW_SCALE = 0.15;

export default class {
  _arrow!: THREE.Object3D;
  _arrowHead!: THREE.Object3D;
  _smallArrowHead!: THREE.Object3D;
  _arrowMesh!: THREE.Object3D;
  _earthRadius: number;
  _pointerMesh!: THREE.Object3D;
  _refVector: THREE.Vector3;
  _earthPos?: THREE.Vector3;

  rootObject!: THREE.Object3D;
  constructor(props: IModelParams) {
    const simple = props.type === "orbit-view";

    // _refVector is used to calculate angle between it and the current earth position.
    this._refVector = new THREE.Vector3(-1, 0, 0);
    this._earthRadius = simple ? c.SIMPLE_EARTH_RADIUS : c.EARTH_RADIUS;

    this._init3DObjects(simple);
    this.setOrbitViewStyle();
  }

  setEarthPos(newPos: THREE.Vector3) {
    this._earthPos = newPos.clone();
    // match edge of the Sun PNG-based sprite
    const sunRealRadius = c.SIMPLE_SUN_RADIUS * (this._smallArrowHead.visible ? 1.1 : 1.41);
    const len = newPos.length() - this._earthRadius - sunRealRadius;
    let angleDiff = newPos.angleTo(this._refVector);
    if (newPos.z < 0) angleDiff *= -1;
    this.rootObject.rotation.y = angleDiff;
    this._arrow.position.x = -len - sunRealRadius;
    this._arrow.scale.x = len;
  }

  _init3DObjects(simple: boolean) {
    this._arrow = this._initArrow(simple);

    const pivot = new THREE.Object3D();
    pivot.add(this._arrow);

    this.rootObject = pivot;
  }

  _initArrow(simple: boolean) {
    const geometry = new THREE.CylinderGeometry(RADIUS, RADIUS, HEIGHT, 32);
    const material = new THREE.MeshPhongMaterial({ color: c.SUN_COLOR, emissive: c.SUN_COLOR });
    this._arrowMesh = new THREE.Mesh(geometry, material);

    const arrowHeadGeo = new THREE.CylinderGeometry(0, LARGE_HEAD_RADIUS, LARGE_HEAD_HEIGHT, 32);
    this._arrowHead = new THREE.Mesh(arrowHeadGeo, material);
    this._arrowHead.position.y = HEIGHT * 0.5;
    this._arrowMesh.add(this._arrowHead);

    const smallArrowHeadGeo = new THREE.CylinderGeometry(0, SMALL_HEAD_RADIUS, SMALL_HEAD_HEIGHT, 32);
    this._smallArrowHead = new THREE.Mesh(smallArrowHeadGeo, material);
    this._smallArrowHead.position.y = HEIGHT * 0.5;
    this._arrowMesh.add(this._smallArrowHead);

    this._arrowMesh.position.x = 0.5 * HEIGHT + 0.5 * LARGE_HEAD_HEIGHT;
    this._arrowMesh.rotation.z = Math.PI * 0.5;

    const container = new THREE.Object3D();
    container.add(this._arrowMesh);

    return container;
  }

  setCloseUpStyle() {
    this._arrowMesh.scale.z = SMALL_ARROW_SCALE;
    this._arrowMesh.scale.x = SMALL_ARROW_SCALE;
    this._smallArrowHead.visible = true;
    this._arrowHead.visible = false;
    this._arrowMesh.position.x = 0.5 * HEIGHT + 0.5 * SMALL_HEAD_HEIGHT;
    if (this._earthPos) {
      this.setEarthPos(this._earthPos);
    }
  }

  setOrbitViewStyle() {
    this._arrowMesh.scale.z = 1;
    this._arrowMesh.scale.x = 1;
    this._smallArrowHead.visible = false;
    this._arrowHead.visible = true;
    this._arrowMesh.position.x = 0.5 * HEIGHT + 0.5 * LARGE_HEAD_HEIGHT;
    if (this._earthPos) {
      this.setEarthPos(this._earthPos);
    }
  }
}
