import * as THREE from "three";
import * as c from "./constants";

const DEG_2_RAD = Math.PI / 180;
const DEF_COLOR = 0xffffff;
const DEF_EMISSIVE = 0x999999;

export default class LatLongMarker {
  earthRadius: number;
  markerRadius: number;
  material: THREE.MeshPhongMaterial;
  mesh: THREE.Mesh;
  rootObject: THREE.Object3D;
  constructor(simple?: boolean) {
    this.markerRadius = simple ? c.LATLNG_MARKER_RADIUS * 9 : c.LATLNG_MARKER_RADIUS;
    const geometry = new THREE.SphereGeometry(this.markerRadius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ emissive: DEF_EMISSIVE });
    const mesh = new THREE.Mesh(geometry, material);
    this.earthRadius = simple ? c.SIMPLE_EARTH_RADIUS * 1.02 : c.EARTH_RADIUS;
    mesh.position.x = this.earthRadius;
    const pivot = new THREE.Object3D();
    pivot.add(mesh);

    this.rootObject = pivot;
    this.mesh = mesh;
    this.material = material;
  }

  setLatLong(lat?: number, long?: number) {
    if (lat != null) {
      lat = lat * DEG_2_RAD;
      this.rootObject.rotation.z = lat;
    }
    if (long != null) {
      long = long * DEG_2_RAD;
      this.rootObject.rotation.y = long;
    }
  }

  setHighlighted(v: boolean) {
    this.material.color.setHex(v ? c.HIGHLIGHT_COLOR : DEF_COLOR);
    this.material.emissive.setHex(v ? c.HIGHLIGHT_EMISSIVE : DEF_EMISSIVE);
  }

  setCloseUpStyle() {
    this.mesh.scale.set(0.5, 0.5, 0.5);
  }

  setOrbitViewStyle() {
    this.mesh.scale.set(1, 1, 1);
  }
}
