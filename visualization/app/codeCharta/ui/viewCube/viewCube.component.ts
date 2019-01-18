import "./viewCube.component.scss";
import * as THREE from "three";
import { IRootScopeService } from "angular";
import { ViewCubemeshGenerator } from "./viewCube.meshGenerator";
import {
    ThreeOrbitControlsService,
    CameraChangeSubscriber
} from "../codeMap/threeViewer/threeOrbitControlsService";
import { PerspectiveCamera } from "three";
import {
    ViewCubeMouseEventsService,
    ViewCubeEventSubscriber
} from "./viewCube.mouseEvents.service";

export class ViewCubeController
    implements CameraChangeSubscriber, ViewCubeEventSubscriber {
    private lights: THREE.Group;
    private cubeGroup: THREE.Group;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private WIDTH = 250;
    private HEIGHT = 250;
    private hoverInfo = { cube: null, originalMaterial: null };

    private cubeDefinition = {
        front: null,
        middle: null,
        back: null
    };

    /* @ngInject */
    constructor(
        private $element,
        private $rootScope: IRootScopeService,
        private threeOrbitControlsService: ThreeOrbitControlsService,
        private viewCubeMouseEventsService: ViewCubeMouseEventsService
    ) {
        this.initCamera();
        this.initLights();
        this.initRenderer(this.$element);
        this.initScene();
        this.initCube();
        this.startAnimation();
        this.viewCubeMouseEventsService.init(
            this.cubeGroup,
            this.camera,
            this.renderer
        );

        this.threeOrbitControlsService.subscribe(this);
        ViewCubeMouseEventsService.subscribeToHoverEvents(
            this.$rootScope,
            this
        );

        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
    }

    private initCube() {
        const { group, front, middle, back } = ViewCubemeshGenerator.buildCube(
            1.6
        );

        this.cubeGroup = group;
        this.cubeDefinition.front = front;
        this.cubeDefinition.middle = middle;
        this.cubeDefinition.back = back;

        this.scene.add(this.cubeGroup);
    }

    public onCameraChanged(camera: PerspectiveCamera) {
        const newCameraPosition = this.calculateCameraPosition(camera);
        this.setCameraPositionAndAngle(newCameraPosition);
    }

    private setCameraPositionAndAngle(newCameraPosition: THREE.Vector3) {
        this.camera.position.set(
            newCameraPosition.x,
            newCameraPosition.y,
            newCameraPosition.z
        );
        this.camera.lookAt(0, 0, 0);
        this.camera.updateProjectionMatrix();
    }

    private calculateCameraPosition(camera: THREE.PerspectiveCamera) {
        const codeMapTargetVector = this.threeOrbitControlsService.controls.target.clone();
        const codeMapCameraPosition = camera.position.clone();
        return codeMapCameraPosition
            .sub(codeMapTargetVector)
            .normalize()
            .multiplyScalar(3);
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
    }

    private initScene() {
        this.scene = new THREE.Scene();
        this.scene.add(this.lights);
    }

    private initRenderer($element: any) {
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        this.renderer.setClearColor(0x000000, 0.2);
        $element[0].appendChild(this.renderer.domElement);
    }

    private initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            45,
            this.WIDTH / this.HEIGHT,
            0.1,
            1000
        );
        this.camera.position.z = 4;
        const pointLight = new THREE.PointLight(0xffffff);
        pointLight.position.set(
            this.camera.position.x,
            this.camera.position.y,
            this.camera.position.z
        );
        this.camera.add(pointLight);
    }

    public onCubeHovered(cube: THREE.Mesh) {
        this.hoverInfo = {
            cube,
            originalMaterial: cube.material
        };
        (this.hoverInfo.cube
            .material as THREE.MeshLambertMaterial).emissive = new THREE.Color(
            0xf9a602
        );
    }

    public onCubeUnhovered() {
        (this.hoverInfo.cube
            .material as THREE.MeshLambertMaterial).emissive = new THREE.Color(
            0x000000
        );
        this.hoverInfo.cube = null;
    }

    public onCubeClicked(cube: THREE.Mesh) {
        switch (cube) {
            case this.cubeDefinition.front.middle.middle:
                this.threeOrbitControlsService.setFrontView(0, 45, 0);
                break;
            case this.cubeDefinition.back.middle.middle:
                this.threeOrbitControlsService.setFrontView(0, 45, 0);
                break;
        }
    }

    private initLights() {
        this.lights = new THREE.Group();
        const ambilight = new THREE.AmbientLight(0x707070); // soft white light
        const light1 = new THREE.DirectionalLight(0xe0e0e0, 0.8);
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
}

export const viewCubeComponent = {
    selector: "viewCubeComponent",
    template: require("./viewCube.component.html"),
    controller: ViewCubeController
};
