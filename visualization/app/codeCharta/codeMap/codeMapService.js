"use strict";

import * as THREE from "three";

/**
 * Main service to manage the state of the rendered code map
 */
class CodeMapService {

    /* @ngInject */

    /**
     * @external {Object3D} https://threejs.org/docs/?q=Object3#Reference/Core/Object3D
     * @external {Mesh} https://threejs.org/docs/?q=mesh#Reference/Objects/Mesh
     * @constructor
     * @param {Scope} $rootScope
     * @param {ThreeSceneService} threeSceneService
     * @param {TreeMapService} treeMapService
     * @param {TreeMapService} codeMapAssetService
     * @param {TreeMapService} settingsService
     */
    constructor($rootScope, threeSceneService, treeMapService, codeMapAssetService, settingsService) {

        /**
         *
         * @type {TreeMapService}
         */
        this.assetService = codeMapAssetService;
        /**
         *
         * @type {Scene}
         */
        this.scene = threeSceneService.scene;
        /**
         *
         * @type {TreeMapService}
         */
        this.treemapService = treeMapService;
        /**
         *
         * @type {TreeMapService}
         */
        this.settingsService = settingsService;

        /**
         * the root of the scene graph
         * @type {Object3D}
         */
        this.root = {};

        let ctx = this;

        $rootScope.$on("settings-changed", (e, s)=> {
            ctx.applySettings(s);
        });

        this.addLightsToScene();

    }

    /**
     * scales the scene by the given values
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    scaleTo(x, y, z) {
        if (this.root && this.root.scale) {
            this.root.scale.set(x, y, z);
        }
    }

    /**
     * Applies the given settings and redraws the scene
     * @param {Settings} s
     * @listens {settings-changed}
     */
    applySettings(s) {

        //draw
        if (s.areaMetric && s.heightMetric && s.colorMetric && s.map && s.neutralColorRange && s.margin) {
            this.drawFromData(s.map, s.areaMetric, s.heightMetric, s.colorMetric, s.neutralColorRange, s.amountOfTopLabels, s.margin);
        }

        //scale
        if(s.scaling && s.scaling.x && s.scaling.y &&s.scaling.z) {
            this.scaleTo(s.scaling.x, s.scaling.y, s.scaling.z);
        }

    }

    /**
     * Draws the map from the given (dataService) data.
     * @param {CodeMap} map
     * @param {string} areaKey
     * @param {string} heightKey
     * @param {string} colorKey
     * @param {Range} colorConfig
     * @param {number} amountOfTopLabels number of highest buildings with labels
     */
    drawFromData(map, areaKey, heightKey, colorKey, colorConfig, amountOfTopLabels, margin) {
        this.drawMap(map, 500, margin, areaKey, heightKey, colorKey, colorConfig, amountOfTopLabels);
    }

    /**
     * Draws the map
     * @param {CodeMap} map
     * @param {number} s size
     * @param {number} p padding
     * @param {string} areaKey
     * @param {string} heightKey
     * @param {string} colorKey
     * @param {Range} colorConfig
     * @param {number} amountOfTopLabels number of highest buildings with labels
     */
    drawMap(map, s, p, areaKey, heightKey, colorKey, colorConfig, amountOfTopLabels) {

        this.clearScene();

        this.addRoot();

        if (this.settingsService.settings.grid) {
            this.addGrid(s, 50);
        }

        let nodes = this.treemapService.createTreemapNodes(map, s, s, p, areaKey, heightKey);

        let sorted = nodes.sort((a,b)=>{return b.height - a.height;});

        sorted.forEach((node,i)=>{
            this.addNode(node, heightKey, i<amountOfTopLabels);
        });

        this.centerMap(s, s);

        this.drawScene();

        this.colorMap(colorKey, colorConfig);

    }

    /**
     * Adds a grid to the scene
     * @param {number} mapSize
     * @param {number} divisions
     */
    addGrid(mapSize, divisions) {

        let xz = new THREE.GridHelper(mapSize, divisions);

        let xy = new THREE.GridHelper(mapSize, divisions);
        xy.translateY(mapSize);
        xy.translateX(mapSize);
        xy.rotation.z = Math.PI / 2;

        let zy = new THREE.GridHelper(mapSize, divisions);
        zy.translateY(mapSize);
        zy.translateZ(mapSize);
        zy.rotation.y = Math.PI / 2;
        zy.rotation.x = Math.PI / 2;

        let group = new THREE.Object3D();
        group.add(xz);
        group.add(xy);
        group.add(zy);

        this.root.add(group);

    }

    /**
     * Colors the cubes depending on their node data and the given values.
     * @param {string} colorKey
     * @param {Range} neutralColorRange
     */
    colorMap(colorKey, neutralColorRange) {
        this.root.traverse((o)=> {

            if (o.node && o.node.isLeaf) {

                this.colorBase(o, colorKey, neutralColorRange);
                this.colorDelta(o);

            } else if (o.node && !o.node.isLeaf) {

                o.originalMaterial = o.material.clone();
                o.selectedMaterial = this.assetService.selected();
                o.hoveredMaterial = this.assetService.hovered();

            } // else: object is propably a Grouping Object with no node data

        });
    }

    /**
     * Colors the 'folders'
     * @param {object} o folder
     * @param {string} colorKey
     * @param {Range} neutralColorRange
     */
    colorBase(o, colorKey, neutralColorRange) {

        let base = o.children.filter((c)=>!c.isDelta)[0];

        if (!base) {
            return;
        }

        const val = base.node.attributes[colorKey];
        if (val < neutralColorRange.from) {
            base.originalMaterial = neutralColorRange.flipped ? this.assetService.negative() : this.assetService.positive();
        } else if (val > neutralColorRange.to) {
            base.originalMaterial = neutralColorRange.flipped ? this.assetService.positive() : this.assetService.negative();
        } else {
            base.originalMaterial = this.assetService.neutral();
        }

        base.selectedMaterial = this.assetService.selected();
        base.hoveredMaterial = this.assetService.hovered();
        base.material = base.originalMaterial.clone();


    }

    /**
     * colors the delta block of o
     * @param {Object3D} o building with delta
     */
    colorDelta(o) {

        let delta = o.children.filter((c)=>c.isDelta)[0];

        if (!delta) {
            return;
        }

        //only the selected, original and hover mat for delta part. It already has its delta mesh
        delta.originalMaterial = delta.material.clone();
        delta.selectedMaterial = this.assetService.selected();
        delta.hoveredMaterial = this.assetService.hovered();

    }

    /**
     * centers the map at point (w,l)
     * @param {number} w width
     * @param {number} l length
     */
    centerMap(w, l) {
        this.root.translateX(-w / 2);
        this.root.translateZ(-l / 2);
    }

    /**
     * adds a node to the scene
     * @param {object} node
     * @param {string} heightKey
     * @param {boolean} showLabel true if the building should get a label
     */
    addNode(node, heightKey, showLabel) {
        //we need to keep in mind that d3 originally is in 2D, so we need to relabel the axis to match Three.js 3D space
        if (!node.isLeaf) {
            this.addFloor(node.width, node.height, node.length, node.x0, node.z0, node.y0, node.depth, node);
        } else {
            this.addBuilding(node.width, node.height, node.length, node.x0, node.z0, node.y0, node.deltas && this.settingsService.settings.deltas ? node.deltas[heightKey] : 0, node, heightKey, showLabel);
        }
    }

    /**
     * Adds a root node to the scene
     */
    addRoot() {
        this.root = new THREE.Object3D();
    }

    /**
     * Adds a floor to the scene
     * @param {number} w width
     * @param {number} h height
     * @param {number} l length
     * @param {number} x x position
     * @param {number} y y position
     * @param {number} z z position
     * @param {number} depth hierarchical depth
     * @param {object} node the transformed d3 node
     */
    addFloor(w, h, l, x, y, z, depth, node) {
        let mat = depth % 2 ? this.assetService.odd() : this.assetService.even();
        let floor = this.getTransformedMesh(w, h, l, x + w / 2, y + h / 2, z + l / 2, mat, node);
        let group = new THREE.Object3D();
        group.add(floor);
        this.root.add(group);
    }

    /**
     * Adds a building to the scene root. A building is an Object3D with 1 or 2 children cubes. The amount depends on the delta value of the cube.
     * @param {number} w width
     * @param {number} h height
     * @param {number} l length
     * @param {number} x x position
     * @param {number} y y position
     * @param {number} z z position
     * @param {number} heightDelta
     * @param {object} node the transformed d3 node
     * @param {string} heightKey the height metric
     * @param {boolean} showLabel true if the building should get a label
     */
    addBuilding(w, h, l, x, y, z, heightDelta, node, heightKey, showLabel) {
        if (heightDelta > 0) {
            if (heightDelta > h) {
                heightDelta = 1; //scale it for the looks, should not happen though
            }
            let cube = this.getTransformedMesh(w, h - heightDelta, l, x + w / 2, y + (h - heightDelta) / 2, z + l / 2, this.assetService.default(), node);
            let cubeD = this.getTransformedMesh(w, heightDelta, l, x + w / 2, y + (heightDelta) / 2 + (h - heightDelta), z + l / 2, this.assetService.positiveDelta(), node);
            let building = new THREE.Object3D();
            cubeD.isDelta = true;
            building.add(cube);
            building.add(cubeD);
            building.node = node;
            this.root.add(building);
        } else if (heightDelta < 0) {
            if (-heightDelta > h) {
                heightDelta = -1; //scale it for the looks, should not happen though
            }

            let cube = this.getTransformedMesh(w, h, l, x + w / 2, y + h / 2, z + l / 2, this.assetService.default(), node);
            let cubeD = this.getTransformedMesh(w, -heightDelta, l, x + w / 2, y + (-heightDelta) / 2 + h, z + l / 2, this.assetService.negativeDelta(), node);
            let building = new THREE.Object3D();
            cubeD.isDelta = true;
            building.add(cube);
            building.add(cubeD);
            building.node = node;
            this.root.add(building);
        } else {
            let cube = this.getTransformedMesh(w, h, l, x + w / 2, y + h / 2, z + l / 2, this.assetService.default(), node);
            let building = new THREE.Object3D();
            building.add(cube);
            building.node = node;
            this.root.add(building);
        }

        if(showLabel) {
            this.addLabel(x, y, z, w, h, l, node, heightKey);
        }

    }

    /**
    * adds a label at the given position
    * @param {number} x x position
    * @param {number} y y position
    * @param {number} z z position
    * @param {number} w width
    * @param {number} h height
    * @param {number} l length
    * @param {object} node the transformed d3 node
    * @param {string} heightKey the height metric
    */
    addLabel(x, y, z, w, h, l, node, heightKey) {

        if(node.attributes && node.attributes[heightKey]){

            const sprite = this.makeText(node.name + ": " + node.attributes[heightKey], 30);
            sprite.position.set(x+w/2,y+60+h + sprite.heightValue/2,z+l/2);
            this.root.add(sprite);

            // Line
            const material = new THREE.LineBasicMaterial({
                color: 0x0000ff
            });

            const geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3(x + w / 2, y + h, z + l / 2),
                new THREE.Vector3(x + w / 2, y + h + 60, z + l / 2)
            );

            const line = new THREE.Line(geometry, material);
            this.root.add(line);

        }

    }

    /**
     * Returns a text sprite
     * @param {string} message
     * @param {number} fontsize
     * @returns {THREE.Sprite}
     */
     makeText(message, fontsize) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        ctx.font = fontsize + "px Arial";

        const margin = 10;

        // setting canvas width/height before ctx draw, else canvas is empty
        const w = ctx.measureText(message).width;
        const h = fontsize;
        canvas.width = w + margin;
        canvas.height = h + margin; // fontsize * 1.5

        //bg
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.strokeStyle = "rgba(0,0,255,1)";
        ctx.fillRect(0,0,canvas.width, canvas.height);
        ctx.strokeRect(0,0,canvas.width, canvas.height);

        // after setting the canvas width/height we have to re-set font to apply!?! looks like ctx reset
        ctx.font = h + "px Arial";
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.LinearFilter; // NearestFilter;
        texture.needsUpdate = true;

        const spriteMaterial = new THREE.SpriteMaterial({map : texture});
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(canvas.width,canvas.height,1);
        sprite.heightValue = canvas.height;
        return sprite;
    }

    /**
     * Add scene lighting
     */
    addLightsToScene() {
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
        this.scene.add(ambilight);
        this.scene.add(light1);
        this.scene.add(light2);
    }

    /**
     * draws the current scene
     */
    drawScene() {
        this.scene.add(this.root);
    }

    /**
     * clears the current scene. Lights remain in the scene
     */
    clearScene() {
        this.scene.remove(this.root);
    }

    /**
     * Efficiently creates a new mesh.
     * @param {number} scaleX
     * @param {number} scaleY
     * @param {number} scaleZ
     * @param {number} translateX
     * @param {number} translateY
     * @param {number} translateZ
     * @param {LambertMeshMaterial} mat
     * @param {object} node
     * @return {Mesh}
     */
    getTransformedMesh(scaleX, scaleY, scaleZ, translateX, translateY, translateZ, mat, node) {
        let geo = this.assetService.getCubeGeo();
        let mesh = new THREE.Mesh(geo, mat);
        mesh.scale.x = scaleX;
        mesh.scale.y = scaleY;
        mesh.scale.z = scaleZ;
        mesh.translateX(translateX);
        mesh.translateY(translateY);
        mesh.translateZ(translateZ);
        mesh.node = node;
        return mesh;
    }

}

export {CodeMapService};



