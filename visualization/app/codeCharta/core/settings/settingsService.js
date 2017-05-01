"use strict";

import {Settings} from "./model/settings";
import {Range} from "./model/range";

/**
 * Stores and manipulates the current settings
 */ 
class SettingsService {

    /* ngInject */

    /**
     * @constructor 
     * @param {UrlService} urlService 
     * @param {DataService} dataService
     * @param {Scope} $rootScope 
     */
    constructor(urlService, dataService, $rootScope) {

        /**
         * Preset area metric name
         * @type {String}
         */
        this.presetAreaMetric = "RLOC";

        /**
         * Preset color metric name
         * @type {String}
         */
        this.presetColorMetric = "MCC";

        /**
         * Preset height metric name
         * @type {String}
         */
        this.presetHeightMetric = "MCC";

        /**
         * @type {UrlService}
         */
        this.urlService = urlService;

        /**
         * @type {DataService}
         */
        this.dataService = dataService;

        /**
         * @type {Scope}
         */
        this.rootScope = $rootScope;

       /**
        * @type {Settings}
        */
        this.settings = new Settings(
            dataService.data.currentmap,
            new Range(10,20,false),
            this.getMetricOrDefault(dataService.data.metrics, this.presetAreaMetric, dataService.data.metrics[0]),
            this.getMetricOrDefault(dataService.data.metrics, this.presetHeightMetric, dataService.data.metrics[1]),
            this.getMetricOrDefault(dataService.data.metrics, this.presetColorMetric, dataService.data.metrics[2]),
            true,
            false
        );

        let ctx = this;

        $rootScope.$on("data-changed", (event,data) => {
           ctx.onDataChanged(data);
        });

    }

    /**
     * Checks if the given metricName is in the metricsArray. If it is in there, we return it, else we return the defaultValue.
     * @param {String[]} metricsArray an array of metric names
     * @param {String} metricName a metric name to look for
     * @param {String} defaultValue a default name in case metricName was not found
     */
    getMetricOrDefault(metricsArray, metricName, defaultValue) {
        var result = defaultValue;
        metricsArray.forEach((metric) => {
            if(metric === metricName){
                result = metric;
            }
        });
        return result;
    }

    /**
     * if the parameters property metrics is longer than 2 elements then change the map and metric settings according to the parameter. 
     * @listens {data-changed} called on data-changed
     * @emits {settings-changed} transitively on call
     * @param {DataModel} data
     */
    onDataChanged(data) {

        if(data.metrics.length >= 3){
            this.settings.map = data.currentmap;

            if(data.metrics.indexOf(this.settings.areaMetric) === -1){
                //area metric is not set or not in the new metrics and needs to be chosen
                this.settings.areaMetric = this.getMetricOrDefault(data.metrics, this.presetAreaMetric, data.metrics[0]);
            }

            if(data.metrics.indexOf(this.settings.heightMetric) === -1){
                //height metric is not set or not in the new metrics and needs to be chosen
                this.settings.heightMetric = this.getMetricOrDefault(data.metrics, this.presetHeightMetric, data.metrics[1]);
            }

            if(data.metrics.indexOf(this.settings.colorMetric) === -1){
                //color metric is not set or not in the new metrics and needs to be chosen
                this.settings.colorMetric = this.getMetricOrDefault(data.metrics, this.presetColorMetric, data.metrics[2]);
            }

        }

        this.onSettingsChanged();

    }

    /**
     * Broadcasts a settings-changed event with the new {Settings} object as a payload
     * @emits {settings-changed} on call
     */
    onSettingsChanged() {
        this.rootScope.$broadcast("settings-changed", this.settings);

    }

    /**
     * updates the settings object according to url parameters.
     * @emits {settings-changed} transitively on call
     */
    updateSettingsFromUrl() {

        //for every property in settings...
        for (var property in this.settings) {

            //...that is not inherited from object...
            if (this.settings.hasOwnProperty(property) && property !== "map") {

                //...get the query param value for the property...
                var val = this.urlService.getParam(property);

                if (val && val.length > 0) {

                    //if it exists, set ist the settings value
                    this.settings[property] = val;
                }
            }
        }

        //TODO map some special keys like neutralColorRange
        this.onSettingsChanged();

    }

}

export {SettingsService};