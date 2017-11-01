"use strict";

/**
 * Controls the settingsPanel
 */
export class SettingsPanelController {

    /* @ngInject */

    /**
     * @listens {data-changed}
     * @constructor
     * @param {SettingsService} settingsService
     * @param {DataService} dataService
     * @param {Scope} $scope
     * @param {TreeMapService} treeMapService
     */
    constructor(settingsService, dataService, $scope, treeMapService) {

        Object.assign(this, {settingsService, dataService, $scope, treeMapService});

        /**
         * @type {Settings}
         */
        this.settings = settingsService.settings;

        const ctx = this;

        /**
         * Options for the rz color slider
         * @type {Object}
         */
        this.sliderOptions = {
            ceil: treeMapService.getMaxNodeHeightInAllRevisions(settingsService.settings.colorMetric),
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
        this.sliderOptions.ceil = this.treeMapService.getMaxNodeHeightInAllRevisions(settings.colorMetric);
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
    notify() {
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

export const settingsPanelComponent = {
    selector: "settingsPanelComponent",
    template: require("./settingsPanel.html"),
    controller: SettingsPanelController
};



