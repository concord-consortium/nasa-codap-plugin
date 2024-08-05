import { EventEmitter2 as EventEmitter } from "eventemitter2";
import $ from "jquery";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { mousePosNormalized } from "../utils/utils";

export interface Interaction {
  actionName: string;
  test: () => boolean;
  setActive: (isActive: boolean) => void;
  step: () => void;
  // runtime flags used internally
  _active?: boolean;
  _started?: boolean;
}

export interface IBaseView {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  dispatch: EventEmitter;
}

export default class BaseInteraction {
  _firstValue: any;
  _interactionStartTime: number | null;
  _interactions: Interaction[];
  _lastValue: any;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  dispatch: EventEmitter;
  domElement: HTMLElement;
  mouse: THREE.Vector2;
  raycaster: THREE.Raycaster;
  view: IBaseView;
  constructor(view: IBaseView) {
    this.view = view;
    this.domElement = view.renderer.domElement;
    this.camera = view.camera;
    this.controls = view.controls;
    this.dispatch = view.dispatch;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-2, -2); // intentionally out of view, which is limited to [-1, 1] x [-1, 1]
    this._followMousePosition();

    this._interactions = [];
    this._interactionStartTime = null;
    this._firstValue = this._lastValue = null;
  }

  registerInteraction(interaction: Interaction) {
    this._interactions.push(interaction);
  }

  checkInteraction() {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    for (let i = 0; i < this._interactions.length; i++) {
      const int = this._interactions[i];
      if (int._started) {
        int.step();
        return;
      }
    }

    let anyInteractionActive = false;
    for (let i = 0; i < this._interactions.length; i++) {
      const int = this._interactions[i];
      if (!anyInteractionActive && int.test()) {
        this._setInteractionActive(int, i, true);
        anyInteractionActive = true;
      } else {
        this._setInteractionActive(int, i, false);
      }
    }

    this.controls.enableRotate = !anyInteractionActive;
  }

  isUserPointing(mesh: THREE.Mesh) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(mesh);
    if (intersects.length > 0) {
      return intersects;
    } else {
      return false;
    }
  }

  updateLogValue(value: any) {
    if (this._firstValue === null) this._firstValue = value;
    this._lastValue = value;
  }

  _setInteractionActive(int: Interaction, idx: number, v: boolean) {
    if (int._active === v) return;
    int._active = v;
    int.setActive(v);
    const $elem = $(this.domElement);
    const namespace = `interaction-${idx}`;
    if (v) {
      $elem.on(`mousedown.${namespace} touchstart.${namespace}`, () => {
        int._started = true;
        this._interactionStartTime = Date.now();
      });
      $elem.on(`mouseup.${namespace} touchend.${namespace} touchcancel.${namespace}`, () => {
        int._started = false;
        const duration = (Date.now() - this._interactionStartTime!) / 1000; // in seconds
        this._log(int.actionName, duration);
      });
    } else {
      $elem.off(`.${namespace}`);
    }
  }

  _log(actionName: string, duration: number) {
    this.dispatch.emit("log", actionName, {
      value: this._lastValue,
      prevValue: this._firstValue,
      duration
    });
    this._firstValue = this._lastValue = null;
  }

  _followMousePosition() {
    const onMouseMove = (event: any) => {
      const pos = mousePosNormalized(event, this.domElement);
      this.mouse.x = pos.x;
      this.mouse.y = pos.y;
    };
    $(this.domElement).on("mousemove touchmove", onMouseMove);
  }
}
