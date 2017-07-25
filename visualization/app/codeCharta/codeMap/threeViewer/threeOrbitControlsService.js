"use strict";

import * as THREE from "three";
import * as Toc from "three-orbit-controls";

/**
 * Service to manage the three orbit controls in an angular way.
 */
class ThreeOrbitControlsService {

    /**
     * No official docs exist. {@link https://github.com/mattdesl/three-orbit-controls}
     * @typedef {object} ThreeOrbitControls
     */

    /* ngInject */

    /**
     * @constructor
     * @param {ThreeCameraService} threeCameraService
     */
    constructor(threeCameraService, $rootScope) {
        /** @type {ThreeCameraService} **/
        this.cameraService = threeCameraService;
        /** @type {ThreeOrbitControls} **/
        this.controls = {};
        this.rootScope = $rootScope;
    }

    /**
     * Inits the controls on the given DOM Element
     * @param domElement Element with the canvas on it
     */
    init(domElement){
        var ResolvedOrbitControls = Toc.default(THREE);
        this.controls = new ResolvedOrbitControls(this.cameraService.camera, domElement);
        let ctx= this;
        this.controls.addEventListener( "change", function () {
            ctx.onInput(ctx.cameraService.camera);
        });
    }

    onInput(camera) {
        this.rootScope.$broadcast("camera-changed", camera);
    }

}

export {ThreeOrbitControlsService};




