"use strict";
import {STATISTIC_OPS, StatisticMapService} from "../../core/statistic/statisticMapService";

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
         * @type {StatisticMapService}
         */
        this.statisticMapService = settingsService.statisticMapService;

        /**
         *
         * @type {STATISTIC_OPS}
         */
        this.STATISTIC_OPS = STATISTIC_OPS;

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

        /**
         *
         */
        this.setOfMaps= dataService.data.revisions;

        $scope.$on("data-changed", (e,d)=>{ctx.onDataChanged(d);});
        $scope.$on("settings-changed", (e,s)=>{ctx.onSettingsChanged(s);});
    }

    getFilterOperationFunction() {
        return (input)=>{return input + "!!!";};
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
        this.onStatisticsChange();
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

    /**
     * Updates the map before broadcasting the update of the settings
     */
    onStatisticsChange(){
        this.settings.map = this.statisticMapService.unifyMaps(this.setOfMaps, this.settings);
        this.notify();
    }

}

export const settingsPanelComponent = {
    selector: "settingsPanelComponent",
    template: require("./settingsPanel.html"),
    controller: SettingsPanelController
};



