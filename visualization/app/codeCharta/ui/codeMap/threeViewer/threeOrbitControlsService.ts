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

    public setCameraViewAngle(x: number, y: number, z: number) {
        const oldZoom = this.getZoom();

        this.initStandardCameraPosition();
        this.rotateCameraByAngle(x, y);
        this.applyOldZoom(oldZoom);

        this.threeCameraService.camera.updateProjectionMatrix();
    }

    private getZoom() {
        return this.threeCameraService.camera.position.distanceTo(
            new THREE.Vector3(0, 0, 0)
        );
    }

    private applyOldZoom(oldZoom: number) {
        const newZoom = this.getZoom();
        const scale = oldZoom / newZoom;
        this.threeCameraService.camera.position.multiplyScalar(scale);
    }

    private initStandardCameraPosition() {
        //TODO Was passiert wenn CodeMap größer ist?!
        const STANDARD_CAMERA_POSITION = { x: 121.33, y: 1.8, z: 2293 };

        this.threeCameraService.camera.position.set(
            STANDARD_CAMERA_POSITION.x,
            STANDARD_CAMERA_POSITION.y,
            STANDARD_CAMERA_POSITION.z
        );
    }

    private rotateCameraByAngle(x: number, y: number) {
        const DEGREE_TO_RAD_SCALE = Math.PI / 180;
        const xRad = x * DEGREE_TO_RAD_SCALE;
        const yRad = y * DEGREE_TO_RAD_SCALE;

        const rotatationMatrixX = new THREE.Matrix3().set(
            1,
            0,
            0,
            0,
            Math.cos(xRad),
            -Math.sin(xRad),
            0,
            Math.sin(xRad),
            Math.cos(xRad)
        );

        const rotatationMatrixY = new THREE.Matrix3().set(
            Math.cos(yRad),
            0,
            Math.sin(yRad),
            0,
            1,
            0,
            -Math.sin(yRad),
            0,
            Math.cos(yRad)
        );

        const rotatedX = this.threeCameraService.camera
            .getWorldPosition()
            .applyMatrix3(rotatationMatrixX);
        const rotatedY = rotatedX.applyMatrix3(rotatationMatrixY);

        this.threeCameraService.camera.position.set(
            rotatedY.x,
            rotatedY.y,
            rotatedY.z
        );
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
