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
    constructor(settingsService, dataService, $scope, treeMapService) {

        /**
         * @type {Settings}
         */
        this.settings = settingsService.settings;

        /**
         * @type {Scope}
         */
        this.$scope = $scope;

        /**
         * @type {TreeMapService}
         */
        this.treeMapService = treeMapService;

        /**
         *
         * @type {SettingsService}
         */
        this.settingsService = settingsService;

        const ctx = this;

        /**
         * Options for the rz color slider
         * @type {Object}
         */
        this.sliderOptions = {
            ceil: treeMapService.getMaxNodeHeightInAllRevisions(settingsService.settings.heightMetric),
            pushRange: true,
            onChange: ctx.notify.bind(ctx)
        };

        /**
         * metrics array
         * @type {string[]}
         */
        this.metrics = this.sortStringArrayAlphabetically(dataService.data.metrics);

        $scope.$on("data-changed", (e,d)=>{ctx.onDataChanged(d);});
        $scope.$on("settings-changed", (e,s)=>{ctx.onSettingsChanged(s);});

    }

    showUrlParams() {
        window.prompt("Copy to clipboard: Ctrl+C", this.settingsService.getQueryParamString());
    }

    /**
     * called on settings change.
     * @param {Settings} settings
     */
    onSettingsChanged(settings) {
        this.sliderOptions.ceil= this.treeMapService.getMaxNodeHeightInAllRevisions(settings.heightMetric);
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


