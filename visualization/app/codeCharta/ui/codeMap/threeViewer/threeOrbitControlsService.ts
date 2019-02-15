"use strict";
import {ThreeCameraService} from "./threeCameraService";
import {IRootScopeService, IAngularEvent} from "angular";
import {OrbitControls, PerspectiveCamera} from "three";
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

    public controls: OrbitControls;
    public pivotVector: THREE.Vector3;
    public pivot: THREE.Group;

    /* ngInject */
    constructor(
        private threeCameraService: ThreeCameraService,
        private threeSceneService: ThreeSceneService,
        private $rootScope: IRootScopeService
    ) {}

    public rotateCameraInVectorDirection(x: number, y: number, z: number) {
        const zoom = this.getZoom();
        this.lookAtDirectionFromTarget(x, y, z);
        this.applyOldZoom(zoom);
    }

    private lookAtDirectionFromTarget(x: number, y: number, z: number) {
        this.threeCameraService.camera.position.set(
            this.controls.target.x,
            this.controls.target.y,
            this.controls.target.z
        );

        const alignmentCube = new THREE.Mesh(
            new THREE.CubeGeometry(20, 20, 20),
            new THREE.MeshNormalMaterial()
        );

        this.threeSceneService.scene.add(alignmentCube);

        alignmentCube.position.set(
            this.controls.target.x,
            this.controls.target.y,
            this.controls.target.z
        );

        alignmentCube.translateX(x);
        alignmentCube.translateY(y);
        alignmentCube.translateZ(z);

        this.threeCameraService.camera.lookAt(alignmentCube.getWorldPosition());
        this.threeSceneService.scene.remove(alignmentCube);
    }

    private getZoom() {
        return this.threeCameraService.camera.position.distanceTo(
            this.controls.target
        );
    }

    private applyOldZoom(oldZoom: number) {
        this.threeCameraService.camera.translateZ(oldZoom);
    }

    public autoFitTo(obj = this.threeSceneService.mapGeometry) {
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

    public subscribe(subscriber: CameraChangeSubscriber) {
        this.$rootScope.$on(
            ThreeOrbitControlsService.CAMERA_CHANGED_EVENT_NAME,
            (event: IAngularEvent, camera: PerspectiveCamera) => {
                subscriber.onCameraChanged(camera, event);
            }
        );
    }

    public init(domElement) {
        const OrbitControls = require("three-orbit-controls")(require("three"));
        this.controls = new OrbitControls(
            this.threeCameraService.camera,
            domElement
        );
        this.controls.addEventListener("change", () => {
            this.onInput(this.threeCameraService.camera);
        });
    }

    public onInput(camera: PerspectiveCamera) {
        this.$rootScope.$broadcast(
            ThreeOrbitControlsService.CAMERA_CHANGED_EVENT_NAME,
            camera
        );
    }
}

export { ThreeOrbitControlsService };
