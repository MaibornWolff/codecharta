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
     * @param {CodeMapService} codeMapService
     * @param {Scope} $scope
     */
    constructor(settingsService, dataService, codeMapService, $scope, treeMapService) {

        /**
         *
         * @type {Settings}
         */
        this.settings = settingsService.settings;

        this.$scope = $scope;

        this.treeMapService = treeMapService;

        /**
         *
         * @type {SettingsService}
         */
        this.settingsService = settingsService;

        /**
         *
         * @type {CodeMapService}
         */
        this.codeMapService = codeMapService;

        let ctx = this;

        /**
         *
         * @type {{x: number, y: number, z: number}}
         */
        this.scaling = {
            x:1,
            y:1,
            z:1
        };

        this.sliderOptions = {
            ceil: treeMapService.getMaxNodeHeightInAllRevisions(settingsService.settings.heightMetric),
            pushRange: true,
            onChange: ctx.notify.bind(ctx)
        };

        this.metrics = this.sortStringArrayAlphabetically(dataService.data.metrics);

        $scope.$on("data-changed", (e,d)=>{ctx.onDataChanged(d);});
        $scope.$on("settings-changed", (e,s)=>{ctx.onSettingsChanged(s);});

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
     * Tells the codeMapService that scaling changed
     */
    scalingChanged(){
        this.codeMapService.scaleTo(this.scaling.x, this.scaling.y, this.scaling.z);
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


