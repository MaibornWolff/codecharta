"use strict";

import {Settings} from "./model/settings";
import {Scale} from "./model/scale";
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

        let ctx = this;

       /**
        * @type {Settings}
        */
        this.settings = new Settings(
            dataService.data.currentmap,
            new Range(10,20,false),
            ctx.getMetricByIdOrLast(0, dataService.data.metrics),
            ctx.getMetricByIdOrLast(1, dataService.data.metrics),
            ctx.getMetricByIdOrLast(2, dataService.data.metrics),
            true,
            1,
            new Scale(1,1,1),
            new Scale(0,300,1000)
        );

        $rootScope.$on("data-changed", (event,data) => {
            ctx.onDataChanged(data);
        });

        $rootScope.$on("camera-changed", (event,data) => {
            ctx.onCameraChanged(data);
        });

    }

    /**
     * change the map and metric settings according to the parameter.
     * @listens {data-changed} called on data-changed
     * @emits {settings-changed} transitively on call
     * @param {DataModel} data
     */
    onDataChanged(data) {

        this.settings.map = data.currentmap;

        if(data.metrics.indexOf(this.settings.areaMetric) === -1){
            //area metric is not set or not in the new metrics and needs to be chosen
            this.settings.areaMetric = this.getMetricByIdOrLast(0, data.metrics);

        }

        if(data.metrics.indexOf(this.settings.heightMetric) === -1){
            //height metric is not set or not in the new metrics and needs to be chosen
            this.settings.heightMetric = this.getMetricByIdOrLast(1, data.metrics);
        }

        if(data.metrics.indexOf(this.settings.colorMetric) === -1){
            //color metric is not set or not in the new metrics and needs to be chosen
            this.settings.colorMetric = this.getMetricByIdOrLast(2, data.metrics);
        }

        this.onSettingsChanged();

    }

    onCameraChanged(camera) {
        if(
            this.settings.camera.x !== camera.position.x ||
            this.settings.camera.y !== camera.position.y ||
            this.settings.camera.z !== camera.position.z
        ) {
            this.settings.camera.x = camera.position.x;
            this.settings.camera.y = camera.position.y;
            this.settings.camera.z = camera.position.z;
            // There is no component in CC which needs live updates when camera changes. Broadcasting an
            // onSettingsChanged Event would cause big performance issues
            // this.onSettingsChanged();
        }
    }

    /**
     * Broadcasts a settings-changed event with the new {Settings} object as a payload
     * @emits {settings-changed} on call
     */
    onSettingsChanged() {
        this.rootScope.$broadcast("settings-changed", this.settings);
    }

    /**
     * updates the settings object according to url parameters. url parameters are named like the accessors of the Settings object. E.g. scale.x or areaMetric
     * @emits {settings-changed} transitively on call
     */
    updateSettingsFromUrl() {

        let ctx = this;

        var iterateProperties = function(obj,prefix) {
            for(var i in obj) {
                if(obj.hasOwnProperty(i) && i !== "map" && i !== 0 && i){

                    if (typeof obj[i] === "string" || obj[i] instanceof String) {
                        //do not iterate over strings
                    } else {
                        iterateProperties(obj[i], i + ".");
                    }

                    const res = ctx.urlService.getParam(prefix+i);

                    let val = parseFloat(res);

                    if(isNaN(val)){
                        val = res;
                    }

                    if (val === 0 || val) {
                        obj[i] = val;
                    }

                }
            }
        };

        iterateProperties(this.settings, "");

        this.urlUpdateDone = true;

        this.onSettingsChanged();

    }

    /**
     * Updates query params to current settings
     */
    getQueryParamString() {

        let ctx = this;

        let result = "";

        var iterateProperties = function(obj,prefix) {
            for(var i in obj) {
                if(obj.hasOwnProperty(i) && i !== "map" && i !== 0 && i){

                    if (typeof obj[i] === "string" || obj[i] instanceof String) {
                        //do not iterate over strings
                    } else {
                        iterateProperties(obj[i], i + ".");
                    }

                    if(typeof obj[i] === "object" || obj[i] instanceof Object) {
                        //do not print objects in string
                    } else {
                        result += "&" + prefix + i + "=" + obj[i];
                    }

                }

            }

        };

        iterateProperties(this.settings, "", 0);

        return "?" + result.substring(1);

    }

    /**
     * Applies given settings
     * @param {Settings} settings
     */
    applySettings(settings) {
        this.settings.importSettingValues(this.correctSettings(settings));
        this.onSettingsChanged();
    }

    /**
     * Returns a metric from the metrics object. If it is not found the last possible metric will be returned.
     * @param id id
     * @param {object} metrics metrics object
     * @returns {string} metric
     */
    getMetricByIdOrLast (id, metrics) {
        return metrics[Math.min(id, metrics.length-1)];
    }

    /**
     * corrects settings, if the chosen metric is not available in the current map, the first three metrics are chosen as a default.
     * @param {Settings} settings
     */
    correctSettings(settings){
        const result = settings;
        result.map = this.settings.map; //do not change the map
        result.areaMetric = this.getMetricOrDefault(this.dataService.data.metrics, settings.areaMetric,this.getMetricByIdOrLast(0, this.dataService.data.metrics));
        result.heightMetric = this.getMetricOrDefault(this.dataService.data.metrics, settings.heightMetric, this.getMetricByIdOrLast(1, this.dataService.data.metrics));
        result.colorMetric = this.getMetricOrDefault(this.dataService.data.metrics, settings.colorMetric, this.getMetricByIdOrLast(2, this.dataService.data.metrics));
        return result;
    }

    /**
      * Checks if the given metricName is in the metricsArray. If it is in there, we return it, else we return the defaultValue.
      * @param {String[]} metricsArray an array of metric names
      * @param {String} metricName a metric name to look for
      * @param {String} defaultValue a default name in case metricName was not found
      */
    getMetricOrDefault(metricsArray, metricName, defaultValue) {
        let result = defaultValue;
        metricsArray.forEach((metric) => {
            if(metric + "" === metricName + ""){
                    result = metric;
                }
        });

        return result;
    }
}

export {SettingsService};