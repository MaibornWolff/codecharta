import * as THREE from "three";
import { Scene } from "three";
import { Group } from "three";
import { CodeMapMesh } from "../rendering/codeMapMesh";

/**
 * A service which manages the Three.js scene in an angular way.
 */
class ThreeSceneService {
    public static SELECTOR = "threeSceneService";

    public scene: Scene;
    public labels: Group;
    public edgeArrows: Group;
    public mapGeometry: Group;
    private lights: Group;
    private mapMesh: CodeMapMesh;

    constructor() {
        this.scene = new THREE.Scene();

        this.mapGeometry = new THREE.Group();
        this.lights = new THREE.Group();
        this.labels = new THREE.Group();
        this.edgeArrows = new THREE.Group();

        this.initLights();

        this.scene.add(this.mapGeometry);
        this.scene.add(this.edgeArrows);
        this.scene.add(this.labels);
        this.scene.add(this.lights);
    }

    public initLights() {
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

    public setMapMesh(mesh: CodeMapMesh, size: number) {
        this.mapMesh = mesh;

        while (this.mapGeometry.children.length > 0) {
            this.mapGeometry.remove(this.mapGeometry.children[0]);
        }

        this.mapGeometry.position.x = -size / 2.0;
        this.mapGeometry.position.y = 0.0;
        this.mapGeometry.position.z = -size / 2.0;

        this.mapGeometry.add(this.mapMesh.getThreeMesh());
    }

    public getMapMesh(): CodeMapMesh {
        return this.mapMesh;
    }
}

export { ThreeSceneService };
