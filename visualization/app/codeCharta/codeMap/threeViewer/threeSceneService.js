"use strict";

import * as THREE from "three";

/**
 * A service which manages the Three.js scene in an angular way.
 */
class ThreeSceneService {

    /**
     * @external {Scene} https://threejs.org/docs/?q=scene#Reference/Scenes/Scene
     * @constructor
     */
    constructor() {
        /** @type {Scene} **/
        this.scene = new THREE.Scene();
    }

}

export {ThreeSceneService};

