import * as THREE from "three";
import { IModelParams } from "../types";
import * as c from "./constants";

const POINTER_RADIUS = 200000 * c.SF;
const POINTER_TUBE = 60000 * c.SF;

export default class {
  _arrow!: THREE.Object3D;
  _earthRadius: number;
  _pointerMesh!: THREE.Object3D;
  _refVector: THREE.Vector3;
  rootObject!: THREE.Object3D;
  constructor(props: IModelParams) {
    const simple = props.type === "orbit-view";

    // _refVector is used to calculate angle between it and the current earth position.
    this._refVector = new THREE.Vector3(-1, 0, 0);
    this._earthRadius = simple ? c.SIMPLE_EARTH_RADIUS : c.EARTH_RADIUS;

    this._init3DObjects(simple);
  }

  setEarthPos(newPos: THREE.Vector3) {
    const sunRealRadius = c.SIMPLE_SUN_RADIUS * 1.41; // match edge of the Sun PNG-based sprite
    const len = newPos.length() - this._earthRadius - sunRealRadius;
    let angleDiff = newPos.angleTo(this._refVector);
    if (newPos.z < 0) angleDiff *= -1;
    this.rootObject.rotation.y = angleDiff;
    if (this._pointerMesh) {
      this._pointerMesh.position.x = -len;
    }
    this._arrow.position.x = -len - sunRealRadius;
    this._arrow.scale.x = len;
  }

  _init3DObjects(simple: boolean) {
    this._arrow = this._initArrow(simple);

    const container = new THREE.Object3D();
    container.add(this._arrow);
    const pivot = new THREE.Object3D();
    pivot.add(container);

    if (!simple) {
      this._pointerMesh = this._initPointer();
      container.add(this._pointerMesh);
    }

    this.rootObject = pivot;
  }

  _initPointer() {
    const container = new THREE.Object3D();

    for (let i = 2; i < 8; i++) {
      const radius = POINTER_RADIUS * Math.pow(i, 1.5);
      const material = new THREE.MeshPhongMaterial({ color: c.SUN_COLOR, transparent: true, opacity: 1 - i * 0.125 });
      const geometry = new THREE.TorusGeometry(radius, POINTER_TUBE, 6, 16 * i);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.y = Math.PI * 0.5;
      // Based on circle equation: x^2 + y^2 = r^2
      mesh.position.x = Math.sqrt(Math.pow(this._earthRadius, 2) - Math.pow(radius, 2)) - this._earthRadius;
      container.add(mesh);
    }

    return container;
  }

  _initArrow(simple: boolean) {
    const HEIGHT = 1; // arrow will be rescaled dynamically based on earth-sun distance that changes through the year
    const RADIUS = simple ? 1500000 * c.SF : 100000 * c.SF;
    const HEAD_RADIUS = RADIUS * (simple ? 7 : 2);
    const HEAD_HEIGHT = HEIGHT * 0.2;
    const geometry = new THREE.CylinderGeometry(RADIUS, RADIUS, HEIGHT, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: c.SUN_COLOR });
    const mesh = new THREE.Mesh(geometry, material);

    const arrowHeadGeo = new THREE.CylinderGeometry(0, HEAD_RADIUS, HEAD_HEIGHT, 32);
    const arrowHeadMesh = new THREE.Mesh(arrowHeadGeo, material);
    arrowHeadMesh.position.y = HEIGHT * 0.5;
    mesh.add(arrowHeadMesh);

    mesh.position.x = 0.5 * HEIGHT + 0.5 * HEAD_HEIGHT;
    mesh.rotation.z = Math.PI * 0.5;

    const container = new THREE.Object3D();
    container.add(mesh);

    return container;
  }
}
