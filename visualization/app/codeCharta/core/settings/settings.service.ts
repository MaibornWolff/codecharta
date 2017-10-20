import {Range} from "../../model/Range";
import {Scale} from "../../model/Scale";
import {DataService, DataServiceSubscriber, DataModel} from "../data/data.service";
import {
    CameraChangeSubscriber,
    ThreeOrbitControlsService
} from "../../codeMap/threeViewer/threeOrbitControlsService";
import {PerspectiveCamera} from "three";

export interface Settings {

    map: any,
    neutralColorRange: Range,
    areaMetric: string,
    heightMetric: string,
    colorMetric: string,
    deltas: boolean,
    amountOfTopLabels: number,
    scaling: Scale,
    camera: Scale,
    margin: number

}

export interface SettingsServiceSubscriber {
    onSettingsChanged(settings: Settings, event: Event)
}

export class SettingsService implements DataServiceSubscriber, CameraChangeSubscriber{

    public static SELECTOR = "settingsService";

    private _settings: Settings;
    private urlUpdateDone: boolean;


    get settings(): Settings {
        return this._settings;
    }

    /* ngInject */
    constructor(private urlService, private dataService: DataService, private $rootScope, private threeOrbitControlsService: ThreeOrbitControlsService) {

        let ctx = this;

        this._settings = this.getInitialSettings(dataService.data.referenceMap, dataService.data.metrics);

        dataService.subscribe(this);
        threeOrbitControlsService.subscribe(this);

    }

    public subscribe(subscriber: SettingsServiceSubscriber) {
        this.$rootScope.$on("settings-changed", (event, data) => {
            subscriber.onSettingsChanged(data, event);
        });
    }

    private getInitialSettings(referenceMap: any, metrics: string[]): Settings {

        let r: Range = {
            from: 10,
            to: 20,
            flipped: false
        };

        let s: Scale = {
            x: 1, y: 1, z: 1
        };

        let c: Scale = {
            x: 0, y: 300, z: 1000
        };

        return {
            map: referenceMap,
            neutralColorRange: r,
            areaMetric: this.getMetricByIdOrLast(0, metrics),
            heightMetric: this.getMetricByIdOrLast(1, metrics),
            colorMetric: this.getMetricByIdOrLast(2, metrics),
            deltas: true,
            amountOfTopLabels: 1,
            scaling: s,
            camera: c,
            margin: 1
        };

    }

    /**
     * change the map and metric settings according to the parameter.
     * @listens {data-changed} called on data-changed
     * @emits {settings-changed} transitively on call
     * @param {DataModel} data
     */
    public onDataChanged(data: DataModel) {

        this._settings.map = data.referenceMap;

        if (data.metrics.indexOf(this._settings.areaMetric) === -1) {
            //area metric is not set or not in the new metrics and needs to be chosen
            this._settings.areaMetric = this.getMetricByIdOrLast(0, data.metrics);

        }

        if (data.metrics.indexOf(this._settings.heightMetric) === -1) {
            //height metric is not set or not in the new metrics and needs to be chosen
            this._settings.heightMetric = this.getMetricByIdOrLast(1, data.metrics);
        }

        if (data.metrics.indexOf(this._settings.colorMetric) === -1) {
            //color metric is not set or not in the new metrics and needs to be chosen
            this._settings.colorMetric = this.getMetricByIdOrLast(2, data.metrics);
        }

        this.onSettingsChanged();

    }

    onCameraChanged(camera: PerspectiveCamera) {
        if (
            this._settings.camera.x !== camera.position.x ||
            this._settings.camera.y !== camera.position.y ||
            this._settings.camera.z !== camera.position.z
        ) {
            this._settings.camera.x = camera.position.x;
            this._settings.camera.y = camera.position.y;
            this._settings.camera.z = camera.position.z;
            // There is no component in CC which needs live updates when camera changes. Broadcasting an
            // onSettingsChanged Event would cause big performance issues
            // this.onSettingsChanged();
        }
    }

    /**
     * Broadcasts a settings-changed event with the new {Settings} object as a payload
     * @emits {settings-changed} on call
     */
    public onSettingsChanged() {
        this.$rootScope.$broadcast("settings-changed", this._settings);
    }

    /**
     * updates the settings object according to url parameters. url parameters are named like the accessors of the Settings object. E.g. scale.x or areaMetric
     * @emits {settings-changed} transitively on call
     */
    public updateSettingsFromUrl() {

        let ctx = this;

        var iterateProperties = function (obj, prefix) {
            for (var i in obj) {
                if (obj.hasOwnProperty(i) && i !== "map" && i) {

                    if (typeof obj[i] === "string" || obj[i] instanceof String) {
                        //do not iterate over strings
                    } else {
                        iterateProperties(obj[i], i + ".");
                    }

                    const res = ctx.urlService.getParam(prefix + i);

                    let val = parseFloat(res);

                    if (isNaN(val)) {
                        val = res;
                    }

                    if (val === 0 || val) {
                        obj[i] = val;
                    }

                }
            }
        };

        iterateProperties(this._settings, "");

        this.urlUpdateDone = true;

        this.onSettingsChanged();

    }

    /**
     * Updates query params to current settings
     */
    public getQueryParamString() {

        let result = "";

        var iterateProperties = function (obj, prefix) {
            for (var i in obj) {
                if (obj.hasOwnProperty(i) && i !== "map" && i) {

                    if (typeof obj[i] === "string" || obj[i] instanceof String) {
                        //do not iterate over strings
                    } else {
                        iterateProperties(obj[i], i + ".");
                    }

                    if (typeof obj[i] === "object" || obj[i] instanceof Object) {
                        //do not print objects in string
                    } else {
                        result += "&" + prefix + i + "=" + obj[i];
                    }

                }

            }

        };

        iterateProperties(this._settings, "");

        return "?" + result.substring(1);

    }

    /**
     * Applies given settings
     * @param {Settings} settings
     */
    public applySettings(settings) {
        Object.assign(this._settings, settings);
        this.onSettingsChanged();
    }

    /**
     * Returns a metric from the metrics object. If it is not found the last possible metric will be returned.
     * @param id id
     * @param {object} metrics metrics object
     * @returns {string} metric
     */
    private getMetricByIdOrLast(id: number, metrics: string[]): string {
        return metrics[Math.min(id, metrics.length - 1)];
    }

    /**
     * corrects settings, if the chosen metric is not available in the current map, the first three metrics are chosen as a default.
     * @param {Settings} settings
     */
    private correctSettings(settings) {
        const result = settings;
        result.map = this._settings.map; //do not change the map
        result.areaMetric = this.getMetricOrDefault(this.dataService.data.metrics, settings.areaMetric, this.getMetricByIdOrLast(0, this.dataService.data.metrics));
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
    private getMetricOrDefault(metricsArray, metricName, defaultValue) {
        let result = defaultValue;
        metricsArray.forEach((metric) => {
            if (metric + "" === metricName + "") {
                result = metric;
            }
        });

        return result;
    }
}