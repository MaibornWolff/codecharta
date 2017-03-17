"use strict";

import {FileChooserController} from "./fileChooserController.js";

/**
 * Renders the current file chooser
 */
class FileChooserDirective{

    /**
     * @constructor
     */
    constructor() {

        /**
         *
         * @type {string}
         */
        this.templateUrl = "./fileChooser.html";

        /**
         *
         * @type {string}
         */
        this.restrict = "E";

        /**
         *
         * @type {FileChooserController}
         */
        this.controller = FileChooserController;

        /**
         *
         * @type {string}
         */
        this.controllerAs = "ctrl";

        /**
         *
         * @type {boolean}
         */
        this.bindToController = true;

        /**
         * the choosers uniqe id
         * @type {number}
         */
        this.uniqueId = 0;
    }

    /**
     * Links the uniqe id to the scope id and increments it
     * @param {Scope} $scope
     */
    link($scope) {
        $scope.id = "fileChooser" + (this.uniqueId++);
    }

}

export {FileChooserDirective};
