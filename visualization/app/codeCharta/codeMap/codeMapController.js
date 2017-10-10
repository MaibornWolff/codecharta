"use strict";

import * as THREE from "three";
import {intersectionResult} from "./rendering/codeMapGeometricDescription.ts"
import {codeMapMesh} from "./rendering/codeMapMesh.ts"
import {codeMapBuilding} from "./rendering/codeMapBuilding.ts"

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

        if (this.sceneService.getMapMesh() != null)
        {
            let intersectionResult = this.sceneService.getMapMesh().checkMouseRayMeshIntersection(this.mouse, this.cameraService.camera);

            let from = this.hovered;
            let to = null;

            if (intersectionResult.intersectionFound == true)
            {
                to = intersectionResult.building;
            }
            else
            {
                to = null;
            }

            if (from != to)
            {
                this.onBuildingHovered(from, to);
                this.hovered = to;
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

        if (to !== null)
        {
            this.sceneService.getMapMesh().setHighlighted([to]);
        }
        else
        {
            this.sceneService.getMapMesh().clearHighlight();
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

        if (to !== null)
        {
            this.sceneService.getMapMesh().setSelected([to]);
        }
        else
        {
            this.sceneService.getMapMesh().clearSelected();
        }
    }

}

export {CodeMapController};




