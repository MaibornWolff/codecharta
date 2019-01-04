import "./viewCube.component.scss";
import * as THREE from "three";
import $ from "jquery";
import { IRootScopeService, IAngularEvent } from "angular";
import { ViewCubemeshGenerator } from "./viewCube.meshGenerator";
import { Test } from "tslint";

export interface ViewCubeSubscriber {
  onViewCubeEventPropagation(type: string, event: MouseEvent);
}

export class ViewCubeController {
  private static VIEW_CUBE_EVENT_PROPAGATION_EVENT_NAME =
    "view-cube-event-propagation";

  private lights;
  private cubeGroup;
  private camera;
  private renderer;
  private scene;
  private width = 250;
  private height = 250;

  /* @ngInject */
  constructor(private $element, private $rootScope: IRootScopeService) {
    this.initCamera();
    this.initLights();
    this.initRenderer(this.$element);
    this.initScene();
    this.initCube();
    this.startAnimation();
    this.initRendererEventListeners();
  }

  private initCube() {
	const {group, front, middle, back} = ViewCubemeshGenerator.buildCube(1.6);

	this.cubeGroup = group;

    this.scene.add(this.cubeGroup);
  }

  private initRendererEventListeners() {
    this.renderer.domElement.addEventListener(
      "mousemove",
      this.onDocumentMouseMove.bind(this),
      false
    );
    this.renderer.domElement.addEventListener(
      "mouseup",
      this.onDocumentMouseUp.bind(this),
      false
    );
    this.renderer.domElement.addEventListener(
      "mousedown",
      (event: MouseEvent) => {
        if (!this.isCubeIntersectedByMouse(event)) {
          ViewCubeController.triggerViewCubeEventPropagation(
            this.$rootScope,
            "mousedown",
            event
          );
        }
      },
      false
    );
    this.renderer.domElement.addEventListener(
      "dblclick",
      (event: MouseEvent) => {
        if (!this.isCubeIntersectedByMouse(event)) {
          ViewCubeController.triggerViewCubeEventPropagation(
            this.$rootScope,
            "dblclick",
            event
          );
        }
      },
      false
    );
  }

  private startAnimation() {
    const animate = () => {
      requestAnimationFrame(animate.bind(this));
      this.onAnimationFrame();
    };
    animate();
  }

  private onAnimationFrame() {
    this.renderer.render(this.scene, this.camera);
    this.cubeGroup.rotation.x -= 0.01;
    this.cubeGroup.rotation.y -= 0.001;
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.scene.add(this.lights);
  }

  private initRenderer($element: any) {
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 0.2);
    $element[0].appendChild(this.renderer.domElement);
  }

  private initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.z = 1.5;
  }

  private isCubeIntersectedByMouse(event: MouseEvent) {
    const vector = this.transformIntoCanvasVector(event);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(vector, this.camera);
    return ray.intersectObjects([this.cubeGroup]).length > 0;
  }

  private transformIntoCanvasVector(event: MouseEvent) {
    const topOffset =
      $(this.renderer.domElement).offset().top - $(window).scrollTop();
    const leftOffset =
      $(this.renderer.domElement).offset().left - $(window).scrollLeft();
    const mouse = {
      x:
        ((event.clientX - leftOffset) / this.renderer.domElement.width) * 2 - 1,
      y:
        -((event.clientY - topOffset) / this.renderer.domElement.height) * 2 + 1
    };
    return new THREE.Vector2(mouse.x, mouse.y);
  }

  private onDocumentMouseMove(event: MouseEvent) {
    if (this.isCubeIntersectedByMouse(event)) {
      //TODO
    } else {
      ViewCubeController.triggerViewCubeEventPropagation(
        this.$rootScope,
        "mousemove",
        event
      );
    }
  }

  private onDocumentMouseUp(event: MouseEvent) {
    if (this.isCubeIntersectedByMouse(event)) {
      //TODO
    } else {
      ViewCubeController.triggerViewCubeEventPropagation(
        this.$rootScope,
        "mouseup",
        event
      );
    }
  }

  private initLights() {
    this.lights = new THREE.Group();
    const ambilight = new THREE.AmbientLight(0x707070); // soft white light
    const light1 = new THREE.DirectionalLight(0xe0e0e0, 1);
    light1.position.set(50, 10, 8).normalize();
    light1.castShadow = false;
    light1.shadow.camera.right = 5;
    light1.shadow.camera.left = -5;
    light1.shadow.camera.top = 5;
    light1.shadow.camera.bottom = -5;
    light1.shadow.camera.near = 2;
    light1.shadow.camera.far = 100;

    const light2 = new THREE.DirectionalLight(0xe0e0e0, 1);
    light2.position.set(-50, 10, -8).normalize();
    light2.castShadow = false;
    light2.shadow.camera.right = 5;
    light2.shadow.camera.left = -5;
    light2.shadow.camera.top = 5;
    light2.shadow.camera.bottom = -5;
    light2.shadow.camera.near = 2;
    light2.shadow.camera.far = 100;

    this.lights.add(ambilight);
    this.lights.add(light1);
    this.lights.add(light2);
  }

  public static subscribe(
    $rootScope: IRootScopeService,
    subscriber: ViewCubeSubscriber
  ) {
    $rootScope.$on(
      ViewCubeController.VIEW_CUBE_EVENT_PROPAGATION_EVENT_NAME,
      (event: IAngularEvent, params: { type: string; e: MouseEvent }) => {
        subscriber.onViewCubeEventPropagation(params.type, params.e);
      }
    );
  }

  private static triggerViewCubeEventPropagation(
    $rootScope: IRootScopeService,
    type: string,
    event: MouseEvent
  ) {
    $rootScope.$broadcast(
      ViewCubeController.VIEW_CUBE_EVENT_PROPAGATION_EVENT_NAME,
      { e: event, type: type }
    );
  }
}

export const viewCubeComponent = {
  selector: "viewCubeComponent",
  template: require("./viewCube.component.html"),
  controller: ViewCubeController
};
