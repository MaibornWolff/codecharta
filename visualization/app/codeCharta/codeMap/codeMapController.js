"use strict";

import * as THREE from "three";
import {intersectionResult} from "./rendering/codeMapGeometricDescription"
import {codeMapMesh} from "./rendering/codeMapMesh"
import {codeMapBuilding} from "./rendering/codeMapBuilding"

/**
 * Controls the codeMapDirective
 */
class CodeMapController {

    /* @ngInject */

    /**
     * @external {Raycaster} https://threejs.org/docs/?q=rayca#Reference/Core/Raycaster
     * @constructor
     * @param {Scope} $rootScope
     * @param {ThreeCameraService} threeCameraService
     * @param {ThreeRendererService} threeRendererService
     * @param {ThreeSceneService} threeSceneService
     * @param {ThreeSceneService} threeUpdateCycleService
     *
     */
    constructor($rootScope, threeCameraService, threeRendererService, threeSceneService, threeUpdateCycleService){

        /**
         * hovered mesh
         * @type {object}
         */
        this.hovered = null;

        /**
         * selected mesh
         * @type {object}
         */
        this.selected = null;

        /**
         *
         * @type {ThreeCameraService}
         */
        this.cameraService = threeCameraService;

        /**
         *
         * @type {ThreeRendererService}
         */
        this.renderService = threeRendererService;

        /**
         *
         * @type {ThreeSceneService}
         */
        this.sceneService = threeSceneService;

        /**
         *
         * @type {Scope}
         */
        this.$rootScope = $rootScope;

        /**
         *
         * @type {Raycaster}
         */
        this.raycaster = new THREE.Raycaster();

        /**
         * current mouse position
         * @type {{x: number, y: number}}
         */
        this.mouse = {x: 0, y: 0};

        document.addEventListener("mousemove", this.onDocumentMouseMove.bind(this), false);
        document.addEventListener("click", this.onDocumentMouseDown.bind(this), false);

        threeUpdateCycleService.updatables.push(this.update.bind(this));

    }

    /**
     * Update method which is bound to the {@link UpdateCycleService}
     */
    update() {
        this.cameraService.camera.updateMatrixWorld();

        this.raycaster.setFromCamera(this.mouse, this.cameraService.camera);

        var intersects = this.raycaster.intersectObjects(this.sceneService.scene.children, true);

        var from = this.hovered;

        if ( intersects.length > 0 ) {

            if ( this.hovered !== intersects[ 0 ].object) {
                this.hovered =intersects[ 0 ].object;
                this.onBuildingHovered(from, this.hovered);
                /**
                 * a lock to prevent event spamming
                 * @type {boolean}
                 */
                this.lock = false;
            }
        } else if(!this.lock){
            this.hovered = null;
            this.onBuildingHovered(from, null);
            this.lock = true;
        }

        if (this.sceneService.getMapMesh() != null)
        {
            let intersectionResult = this.sceneService.getMapMesh().checkMouseRayMeshIntersection(this.mouse, this.cameraService.camera);

            if (intersectionResult.intersectionFound)
            {
                this.sceneService.getMapMesh().setHighlighted(intersectionResult.building);
            }
            else
            {
                this.sceneService.getMapMesh().clearHighlight();
            }
        }
    }

    /**
     * updates {CodeMapController.mouse} on mouse movement
     * @param {MouseEvent} event
     */
    onDocumentMouseMove (event) {
        this.mouse.x = ( event.clientX / this.renderService.renderer.domElement.width ) * 2 - 1;
        this.mouse.y = -( event.clientY / this.renderService.renderer.domElement.height ) * 2 + 1;
    }

    /**
     * updates {CodeMapController} on mouse down
     */
    onDocumentMouseDown() {

        var from = this.selected;

        if (this.hovered) {
            this.selected = this.hovered;
            this.onBuildingSelected(from, this.selected);
        }

        if(!this.hovered && this.selected) {
            this.selected = null;
            this.onBuildingSelected(from, null);
        }

    }

    /**
     * Called when a building is hovered.
     * @param from old building
     * @param to new building
     * @emits {building-hovered} on hover
     */
    onBuildingHovered(from, to){

        /*
        if the hovered node does not have useful data, then we should look at its parent. If the parent has useful data
        then this parent is a delta node which is made of two seperate, data-free nodes. This quick fix helps us to
        handle delta objects, until there is a method for mergng their meshes and materials correctly.
        See codeMapService.js
         */
        if(to && !to.node){
            if(to.parent && to.parent.node){
                to.node = to.parent.node;
            }
        }

        this.$rootScope.$broadcast("building-hovered", {to: to, from: from});

        this.unhoverGroup(from);
        this.hoverGroup(to);

    }

    /**
     * Unhovers a group
     * @param {object} mesh
     */
    unhoverGroup(mesh) {

        let ctx = this;

        if(mesh && mesh.parent) {
            // buildings are grouped in parent meshes, therefore we should look only at these

            mesh.parent.children.forEach((c)=> {
                if (c && c.material && c.material.emissive){
                    c.material.emissive.setHex(0x000000);
                }
            });

        }

    }

    /**
     * Checks if the given mesh is in meshes array. Ignores itself in meshes array
     * @param {object} meshes
     * @param {object} mesh
     * @param {object} current
     * @return {boolean} true if found, false if not
     */
    meshIsInMeshesWithoutCurrent(meshes, mesh, current){
        meshes.forEach((m)=>{
            if (m===mesh && m!==current){
                return true;
            }
        });
        return false;
    }

    /**
     * Hovers a group.
     * @param {object} mesh
     */
    hoverGroup(mesh) {

        if(mesh && mesh.parent){
            // buildings are grouped in parent meshes, therefore we should look only at these
            mesh.parent.children.forEach((c)=>{
                if (c && c.material && c.material.emissive) {
                    c.material.emissive.setHex(0x666666);
                }
            });

        }

    }

    /**
     * unselects a group
     * @param {object} mesh
     */
    unselectGroup(mesh) {

        if (mesh && mesh.parent) {

            // buildings are grouped in parent meshes, therefore we should look only at these
            mesh.parent.children.forEach((c)=> {
                if (c && c.originalMaterial) {
                    c.material = c.originalMaterial.clone();
                }
            });

        }

    }

    /**
     * selects a group
     * @param {object} mesh
     */
    selectGroup(mesh) {

        // the floors parent is root and floors do not have deltacubes.
        if(mesh && mesh.parent) {

            // buildings are grouped in parent meshes, therefore we should look only at these
            mesh.parent.children.forEach((c)=> {
                if (c && c.selectedMaterial) {
                    c.material = c.selectedMaterial.clone();
                }
            });

        }

    }

    /**
     * called when a building is selected.
     * @param from previously selected building
     * @param to currently selected building
     * @emits {building-selected} when building is selected
     */
    onBuildingSelected(from, to){

        this.$rootScope.$broadcast("building-selected", {to: to, from:from});

        this.unselectGroup(from);
        this.selectGroup(to);

    }

}

export {CodeMapController};




