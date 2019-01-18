"use strict";
import { ThreeCameraService } from "./threeCameraService";
import { IRootScopeService, IAngularEvent } from "angular";
import { OrbitControls, PerspectiveCamera } from "three";
import * as THREE from "three";
import { ThreeSceneService } from "./threeSceneService";

export interface CameraChangeSubscriber {
    onCameraChanged(camera: PerspectiveCamera, event: IAngularEvent);
}

/**
 * Service to manage the three orbit controls in an angular way.
 */
class ThreeOrbitControlsService {
    public static SELECTOR = "threeOrbitControlsService";
    public static CAMERA_CHANGED_EVENT_NAME = "camera-changed";

    controls: OrbitControls;
    pivotVector: THREE.Vector3;
    pivot: THREE.Group;

    /* ngInject */
    constructor(
        private threeCameraService: ThreeCameraService,
        private threeSceneService: ThreeSceneService,
        private $rootScope: IRootScopeService
    ) {}

    setCameraViewToAngle(x: number, y: number, z: number) {
        const DEGREE_TO_RAD_SCALE = Math.PI / 180;

        this.pivot.rotateX(x * DEGREE_TO_RAD_SCALE);
        this.pivot.rotateY(y * DEGREE_TO_RAD_SCALE);
        this.pivot.rotateZ(z * DEGREE_TO_RAD_SCALE);

        this.threeCameraService.camera.updateProjectionMatrix();
    }

    autoFitTo(obj = this.threeSceneService.mapGeometry) {
        const boundingSphere = new THREE.Box3()
            .setFromObject(obj)
            .getBoundingSphere();

        const scale = 1.4; // object size / display size
        const objectAngularSize =
            ((this.threeCameraService.camera.fov * Math.PI) / 180) * scale;
        const distanceToCamera =
            boundingSphere.radius / Math.tan(objectAngularSize / 2);
        const len = Math.sqrt(
            Math.pow(distanceToCamera, 2) + Math.pow(distanceToCamera, 2)
        );

        this.threeCameraService.camera.position.set(len, len, len);
        this.controls.update();

        let t = boundingSphere.center.clone();
        t.setY(0);
        this.threeCameraService.camera.lookAt(t);
        this.controls.target.set(t.x, t.y, t.z);

        this.threeCameraService.camera.updateProjectionMatrix();
    }

    subscribe(subscriber: CameraChangeSubscriber) {
        this.$rootScope.$on(
            ThreeOrbitControlsService.CAMERA_CHANGED_EVENT_NAME,
            (event: IAngularEvent, camera: PerspectiveCamera) => {
                subscriber.onCameraChanged(camera, event);
            }
        );
    }

    /**
     * Inits the controls on the given DOM Element
     * @param domElement Element with the canvas on it
     */
    init(domElement) {
        const OrbitControls = require("three-orbit-controls")(require("three"));
        this.controls = new OrbitControls(
            this.threeCameraService.camera,
            domElement
        );
        let ctx = this;
        this.controls.addEventListener("change", function() {
            ctx.onInput(ctx.threeCameraService.camera);
        });

        this.initPivot();
    }

    private initPivot() {
        const boundingSphere = new THREE.Box3()
            .setFromObject(this.threeSceneService.mapGeometry)
            .getBoundingSphere();
        this.pivotVector = boundingSphere.center.clone();
        this.pivotVector.setY(0);
        this.pivot = new THREE.Group();
        this.pivot.position.set(
            this.pivotVector.x,
            this.pivotVector.y,
            this.pivotVector.z
        );
        this.pivot.add(this.threeCameraService.camera);
        this.threeSceneService.scene.add(this.pivot);
    }

    /**
     * Called when the orbit controls receive an user input
     * @param {Camera} camera
     */
    onInput(camera: PerspectiveCamera) {
        this.$rootScope.$broadcast(
            ThreeOrbitControlsService.CAMERA_CHANGED_EVENT_NAME,
            camera
        );
    }
}

export { ThreeOrbitControlsService };
