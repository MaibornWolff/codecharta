"use strict";
import {ThreeCameraService} from "./threeCameraService";
import {IRootScopeService, IAngularEvent} from "angular";
import {OrbitControls, PerspectiveCamera} from "three";

export interface ThreeOrbitControlsServiceSubscriber {
    onCameraChanged(camera: PerspectiveCamera, event: IAngularEvent)
}

/**
 * Service to manage the three orbit controls in an angular way.
 */
class ThreeOrbitControlsService {

    private controls: OrbitControls;

    /* ngInject */

    /**
     * @constructor
     * @param {ThreeCameraService} threeCameraService
     * @param {Scope} rootScope
     */
    constructor(
        private threeCameraService: ThreeCameraService,
        private $rootScope: IRootScopeService
    ) {

    }

    subscribe(subscriber: ThreeOrbitControlsServiceSubscriber) {
        this.$rootScope.$on("camera-changed", (event, camera: PerspectiveCamera) => {
            subscriber.onCameraChanged(camera, event);
        });
    }

    /**
     * Inits the controls on the given DOM Element
     * @param domElement Element with the canvas on it
     */
    init(domElement){
        const THREE = require('three');
        const OrbitControls = require('three-orbit-controls')(THREE);
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
        this.$rootScope.$broadcast("camera-changed", camera);
    }

}

export {ThreeOrbitControlsService};




