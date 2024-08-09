import * as THREE from "three";
import * as c from "./constants";

export default class EarthAxis {
  rootObject: THREE.Object3D;
  arrowHead: THREE.Mesh;
  axis: THREE.Mesh;

  constructor() {
    const HEIGHT = 35000000 * c.SF;
    const RADIUS = 1200000 * c.SF;
    const HEAD_RADIUS = RADIUS * 2.5;
    const EMISSIVE_COL = 0x770000;
    const geometry = new THREE.CylinderGeometry(RADIUS, RADIUS, HEIGHT, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: EMISSIVE_COL });
    this.axis = new THREE.Mesh(geometry, material);

    const arrowHeadGeo = new THREE.SphereGeometry(HEAD_RADIUS, 32, 32);
    this.arrowHead = new THREE.Mesh(arrowHeadGeo, material);
    this.arrowHead.position.y = HEIGHT * 0.5;

    this.rootObject = new THREE.Object3D();
    this.rootObject.add(this.axis);
    this.rootObject.add(this.arrowHead);
  }

  setCloseUpStyle() {
    this.arrowHead.scale.set(0.5, 0.5, 0.5);
    this.axis.scale.set(0.5, 1, 0.5);
  }

  setOrbitViewStyle() {
    this.arrowHead.scale.set(1, 1, 1);
    this.axis.scale.set(1, 1, 1);
  }
}
