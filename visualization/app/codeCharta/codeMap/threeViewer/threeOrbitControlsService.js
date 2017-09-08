"use strict";

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
     * @param {Scope} rootScope
     */
    constructor(threeCameraService, $rootScope) {
        /** @type {ThreeCameraService} **/
        this.cameraService = threeCameraService;
        /** @type {ThreeOrbitControls} **/
        this.controls = {};
        /** @type {Scope} **/
        this.rootScope = $rootScope;
    }

    /**
     * Inits the controls on the given DOM Element
     * @param domElement Element with the canvas on it
     */
    init(domElement){
        const THREE = require('three');
        const OrbitControls = require('three-orbit-controls')(THREE);
        this.controls = new OrbitControls(this.cameraService.camera, domElement);
        let ctx= this;
        this.controls.addEventListener( "change", function () {
            ctx.onInput(ctx.cameraService.camera);
        });
    }

    /**
     * Called when the orbit controls receive an user input
     * @param {Camera} camera
     */
    onInput(camera) {
        this.rootScope.$broadcast("camera-changed", camera);
    }

}

export {ThreeOrbitControlsService};




