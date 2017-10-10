"use strict";
import {ThreeCameraService} from "./threeCameraService";
import {IRootScopeService, IAngularEvent} from "angular";
import {OrbitControls, PerspectiveCamera} from "three";

export interface CameraChangeSubscriber {
    onCameraChanged(camera: PerspectiveCamera, event: IAngularEvent)
}

/**
 * Service to manage the three orbit controls in an angular way.
 */
class ThreeOrbitControlsService {

    public static SELECTOR = "threeOrbitControlsService";
    public static CAMERA_CHANGED_EVENT_NAME = "camera-changed";

    controls: OrbitControls;

    /* ngInject */
    constructor(
        private threeCameraService: ThreeCameraService,
        private $rootScope: IRootScopeService
    ) {}

    subscribe(subscriber: CameraChangeSubscriber) {
        this.$rootScope.$on(ThreeOrbitControlsService.CAMERA_CHANGED_EVENT_NAME, (event: IAngularEvent, camera: PerspectiveCamera) => {
            subscriber.onCameraChanged(camera, event);
        });
    }

    /**
     * Inits the controls on the given DOM Element
     * @param domElement Element with the canvas on it
     */
    init(domElement){
        const OrbitControls = require('three-orbit-controls')(require("three"));
        this.controls = new OrbitControls(this.threeCameraService.camera, domElement);
        let ctx= this;
        this.controls.addEventListener( "change", function () {
            ctx.onInput(ctx.threeCameraService.camera);
        });
    }

    /**
     * Called when the orbit controls receive an user input
     * @param {Camera} camera
     */
    onInput(camera: PerspectiveCamera) {
        this.$rootScope.$broadcast(ThreeOrbitControlsService.CAMERA_CHANGED_EVENT_NAME, camera);
    }

}

export {ThreeOrbitControlsService};




