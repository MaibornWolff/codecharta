"use strict";
/**
 * Controls the settingsPanel
 */
class SettingsPanelController {

    /* @ngInject */

    /**
     * @listens {data-changed}
     * @constructor
     * @param {SettingsService} settingsService
     * @param {DataService} dataService
     * @param {Scope} $scope
     */
    constructor(settingsService, dataService, $scope) {

        /**
         *
         * @type {Settings}
         */
        this.settings = settingsService.settings;

        /**
         *
         * @type {string[]}
         */
        this.metrics = this.sortStringArrayAlphabetically(dataService.data.metrics);

        /**
         *
         * @type {SettingsService}
         */
        this.settingsService = settingsService;

        let ctx = this;

        $scope.$on("data-changed", (e,d)=>{ctx.onDataChanged(d);});

    }

    showUrlParams() {
        window.prompt("Copy to clipboard: Ctrl+C", this.settingsService.getQueryParamString());
    }

    /**
     * called on data change.
     * @param {DataModel} data
     */
    onDataChanged(data) {
        this.metrics = this.sortStringArrayAlphabetically(data.metrics);
    }

    /**
     * Notifies the settings service about changes.
     */
    notify(){
        this.settingsService.onSettingsChanged();
    }

    /**
     * Sorts a simple string array in alphabetic order.
     * @param {string[]} arr
     * @returns {string[]} sortedArr
     */
    sortStringArrayAlphabetically(arr) {
        return arr.sort();
    }

}

export {SettingsPanelController};


