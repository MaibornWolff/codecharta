"use strict";

import * as THREE from "three";
import {geometryGenerator} from "./../rendering/geometryGenerator.ts"
import {labelManager} from "./../rendering/labelManager.ts"

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
        this.labelManager = new labelManager();

        this.mapGeometry = new THREE.Group();
        this.lights = new THREE.Group();
        this.labels = new THREE.Group();

        this.initLights();

        this.scene.add(this.mapGeometry);
        this.scene.add(this.lights);
    }

    initLights()
    {
        const ambilight = new THREE.AmbientLight(0x707070); // soft white light
        const light1 = new THREE.DirectionalLight(0xe0e0e0, 1);
        light1.position.set(50, 10, 8).normalize();
        light1.castShadow = false;
        light1.shadow.camera.right = 5;
        light1.shadow.camera.left = -5;
        light1.shadow.camera.top = 5;
        light1.shadow.camera.bottom = -5;
        light1.shadow.camera.near = 2;
        light1.shadow.camera.far = 100;
        const light2 = new THREE.DirectionalLight(0xe0e0e0, 1);
        light2.position.set(-50, 10, -8).normalize();
        light2.castShadow = false;
        light2.shadow.camera.right = 5;
        light2.shadow.camera.left = -5;
        light2.shadow.camera.top = 5;
        light2.shadow.camera.bottom = -5;
        light2.shadow.camera.near = 2;
        light2.shadow.camera.far = 100;
        this.lights.add(ambilight);
        this.lights.add(light1);
        this.lights.add(light2);
    }

    /**
     * @param {THREE.Mesh}
     */
    setMapGeometry(mesh, size)
    {
        while(this.mapGeometry.children.length > 0){
            this.mapGeometry.remove(
                this.mapGeometry.children[0]
            );
        }

        this.mapGeometry.add(mesh);

        this.mapGeometry.position.x = -size / 2.0;
        this.mapGeometry.position.y = 0.0;
        this.mapGeometry.position.z = -size / 2.0;
    }
}

export {ThreeSceneService};

