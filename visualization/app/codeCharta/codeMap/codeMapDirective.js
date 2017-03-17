"use strict";

import {CodeMapController} from "./codeMapController.js";

/**
 * Renders the codeMap canvas.
 */
class CodeMapDirective {

    /**
     * @constructor
     * @param {ThreeViewerService} threeViewerService
     * @param {CodeMapService} codeMapService
     */
    constructor(
        threeViewerService,
        codeMapService
    ) {
        /** @type {string} **/
        this.template = "<div id='#codeMap'></div>";

        /** @type {string} **/
        this.restrict = "E";

        /** @type {Scope} **/
        this.scope = {};

        /**
         * @type {ThreeViewerService}
         */
        this.viewerService = threeViewerService;

        /**
         * @type {CodeMapService}
         */
        this.codeMapService = codeMapService;

        /**
         * @type {CodeMapController}
         */
        this.controller = CodeMapController;

        /** @type {string} **/
        this.controllerAs = "ctrl";

        /** @type {boolean} **/
        this.bindToController = true;

    }

    /**
     * Inits the three canvas and starts animating
     * @param {Scope} $scope
     * @param {object} element domElement
     */
    link($scope, element) {
        
        //init and animate ViewerService on div
        this.viewerService.init(element[0]);
        this.viewerService.animate();

    }

}

export {CodeMapDirective};



