"use strict";

import * as THREE from "three";

/**
 * A service which manages the Three.js renderer in an angular way.
 */
class ThreeRendererService {

    /**
     * @external {WebGLRenderer} https://threejs.org/docs/api/renderers/WebGLRenderer.html
     * @constructor
     */
    constructor() {
        /**
         * @type {WebGLRenderer}
         */
        this.renderer = {};
    }

    /**
     * Inits the renderer.
     * @param {number} containerWidth initial width
     * @param {number} containerHeight initial height
     */
    init(containerWidth, containerHeight){
        this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true  });
        this.renderer.setSize(containerWidth, containerHeight);
        this.renderer.setClearColor(0xeeeedd, 1.0);
    }

}

export {ThreeRendererService};

