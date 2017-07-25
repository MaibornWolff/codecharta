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
    constructor() {
        /**
         * @type {PerspectiveCamera}
         */
        this.camera = {};
    }

    /**
     * Inits the camera with a specific container width and height
     * @param containerWidth initial width
     * @param containerHeight initial height
     */
    init(containerWidth, containerHeight, x, y, z) {
        var VIEW_ANGLE = 45;
        var ASPECT = containerWidth / containerHeight;
        var NEAR = 100;
        var FAR = 20000;

        this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        this.camera.position.set(x,y,z);
    }

}

export {ThreeCameraService};




