"use strict";

import * as THREE from "three";

/**
 * Manages the three js camera in an angular way.
 */
class ThreeCameraService {

    /**
     * @constructor
     * @external {PerspectiveCamera} https://threejs.org/docs/#Reference/Cameras/PerspectiveCamera
     */
    constructor($rootScope) {
        /**
         * @type {PerspectiveCamera}
         */
        this.camera = {};

        let ctx = this;

        $rootScope.$on("settings-changed", (event,settings) => {
            ctx.setPosition(settings.camera.x, settings.camera.y, settings.camera.z);
        });
    }

    /**
     * Inits the camera with a specific container width and height
     * @param {number} containerWidth initial width
     * @param {number} containerHeight initial height
     * @param {number} x camera position component x
     * @param {number} y camera position component y
     * @param {number} z camera position component z
     */
    init(containerWidth, containerHeight, x, y, z) {
        var VIEW_ANGLE = 45;
        var ASPECT = containerWidth / containerHeight;
        var NEAR = 100;
        var FAR = 20000;

        this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        this.setPosition(x, y, z);
    }

    setPosition(x, y, z) {
        this.camera.position.set(x,y,z);
    }

}

export {ThreeCameraService};




