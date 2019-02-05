import * as THREE from "three";
import { Scene } from "three";
import { Group } from "three";
import { CodeMapMesh } from "../rendering/codeMapMesh";

/**
 * A service which manages the Three.js scene in an angular way.
 */
class ThreeSceneService {
    public static SELECTOR = "threeSceneService";

    scene: Scene;
    private lights: Group;
    public labels: Group;
    public edgeArrows: Group;
    public mapGeometry: Group;
    private mapMesh: CodeMapMesh;
    public targetHelper: THREE.Mesh;

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

        /*const cubeGeometry = new THREE.BoxGeometry(500, 500, 500);
        const cube = new THREE.Mesh(
            cubeGeometry,
            new THREE.MeshLambertMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.8
            })
        );

        this.targetHelper = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5));

        const cubeBoundingBox = new THREE.BoxHelper(
            cube,
            new THREE.Color(0x000000)
        );

        this.scene.add(this.targetHelper);

        this.scene.add(cubeBoundingBox);*/

        const axesHelper = new THREE.AxesHelper(2000);

        this.scene.add(axesHelper);

        //this.scene.add(cube);
    }

    initLights() {
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

    setMapMesh(mesh: CodeMapMesh, size: number) {
        this.mapMesh = mesh;

        while (this.mapGeometry.children.length > 0) {
            this.mapGeometry.remove(this.mapGeometry.children[0]);
        }

        this.mapGeometry.position.x = -size / 2.0;
        this.mapGeometry.position.y = 0.0;
        this.mapGeometry.position.z = -size / 2.0;

        this.mapGeometry.add(this.mapMesh.getThreeMesh());
    }

    getMapMesh(): CodeMapMesh {
        return this.mapMesh;
    }
}

export { ThreeSceneService };
