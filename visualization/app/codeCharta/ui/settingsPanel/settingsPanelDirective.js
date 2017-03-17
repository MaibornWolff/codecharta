"use strict";

import {SettingsPanelController} from "./settingsPanelController.js";
/**
 * Renders the settingsPanel
 */
class SettingsPanelDirective {

    /**
     * @constructor
     */
    constructor() {
        /**
         *
         * @type {string}
         */
        this.templateUrl = "./settingsPanel.html";

        /**
         *
         * @type {string}
         */
        this.restrict = "E";

        /**
         *
         * @type {Scope}
         */
        this.scope = {};

        /**
         *
         * @type {SettingsPanelController}
         */
        this.controller = SettingsPanelController;

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
    }
    
}

export {SettingsPanelDirective};

