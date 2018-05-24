import {DataService, DataServiceSubscriber, DataModel} from "../data/data.service";
import {
    CameraChangeSubscriber,
    ThreeOrbitControlsService
} from "../../ui/codeMap/threeViewer/threeOrbitControlsService";
import {PerspectiveCamera} from "three";
import {STATISTIC_OPS} from "../statistic/statistic.service";
import {DeltaCalculatorService} from "../data/data.deltaCalculator.service";
import * as d3 from "d3";
import {DataDecoratorService} from "../data/data.decorator.service";
import {CodeMap} from "../data/model/CodeMap";

export interface Range {
    from: number; to: number; flipped: boolean;
}

export interface Scale {
    x: number;
    y: number;
    z: number;
}

export interface Settings {

    map: CodeMap;
    neutralColorRange: Range;
    areaMetric: string;
    heightMetric: string;
    colorMetric: string;
    deltas: boolean;
    amountOfTopLabels: number;
    scaling: Scale;
    camera: Scale;
    margin: number;
    operation: STATISTIC_OPS;
    deltaColorFlipped: boolean;
    showDependencies: boolean;
    minimizeDetailPanel: boolean;
    invertHeight: boolean;
}

export interface SettingsServiceSubscriber {
    onSettingsChanged(settings: Settings, event: Event);
}

export class SettingsService implements DataServiceSubscriber, CameraChangeSubscriber {

    public static SELECTOR = "settingsService";

    private _settings: Settings;

    public numberOfCalls: number;

    private _lastDeltaState = false;

    /* ngInject */
    constructor(private urlService, private dataService: DataService, private $rootScope,
                private threeOrbitControlsService: ThreeOrbitControlsService, private statisticMapService, private deltaCalculatorService: DeltaCalculatorService,
                private dataDecoratorService: DataDecoratorService) {

        this._settings = this.getInitialSettings(dataService.data.renderMap, dataService.data.metrics);

        this.numberOfCalls = 0;
        dataService.subscribe(this);
        threeOrbitControlsService.subscribe(this);

    }

    public subscribe(subscriber: SettingsServiceSubscriber) {
        this.$rootScope.$on("settings-changed", (event, data) => {
            subscriber.onSettingsChanged(data, event);
        });
    }

    private getInitialSettings(renderMap: any, metrics: string[]): Settings {

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

        this._lastDeltaState = false;

        let settings: Settings =  {
            map: renderMap,
            neutralColorRange: r,
            areaMetric: this.getMetricByIdOrLast(0, metrics),
            heightMetric: this.getMetricByIdOrLast(1, metrics),
            colorMetric: this.getMetricByIdOrLast(2, metrics),
            deltas: false,
            amountOfTopLabels: 1,
            scaling: s,
            camera: c,
            margin: 1,
            operation: STATISTIC_OPS.NOTHING,
            deltaColorFlipped: false,
            showDependencies: false,
            minimizeDetailPanel: false,
            invertHeight: false
        };

        return settings;

    }

    private onActivateDeltas() {
        this.dataService.onActivateDeltas();
    }

    private onDeactivateDeltas() {
        this.dataService.onDeactivateDeltas();
    }

    /**
     * change the map and metric settings according to the parameter.
     * @listens {data-changed} called on data-changed
     * @emits {settings-changed} transitively on call
     * @param {DataModel} data
     */
    public onDataChanged(data: DataModel) {

        this._settings.map = data.renderMap; // reference map is always the map which should be drawn

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

        if (this._lastDeltaState && !this._settings.deltas) {
            this._lastDeltaState = false;
            this.onDeactivateDeltas();
        } else

        if (!this._lastDeltaState && this._settings.deltas) {
            this._lastDeltaState = true;
            this.onActivateDeltas();
        }

        this.$rootScope.$broadcast("settings-changed", this._settings);
    }

    /**
     * updates the settings object according to url parameters. url parameters are named like the accessors of the Settings object. E.g. scale.x or areaMetric
     * @emits {settings-changed} transitively on call
     */
    public updateSettingsFromUrl() {

        let ctx = this;

        let iterateProperties = function (obj, prefix) {
            for (let i in obj) {
                if (obj.hasOwnProperty(i) && i !== "map" && i) {

                    if (typeof obj[i] === "string" || obj[i] instanceof String) {
                        //do not iterate over strings
                    } else {
                        iterateProperties(obj[i], i + ".");
                    }

                    const res = ctx.urlService.getParam(prefix + i);

                    if (res) {

                        if (res == "true") {
                            obj[i] = true;
                        } else if (res == "false") {
                            obj[i] = false;
                        } else if (res === 0 || res) {

                            let val = parseFloat(res);

                            if (isNaN(val)) {
                                val = res;
                            }

                            obj[i] = val;
                        } else {
                            obj[i] = res;
                        }

                        // if we work with strings here it can cause errors in other parts of the app, check with console.log(typeof obj[i], obj[i]);
                    }

                }
            }
        };

        iterateProperties(this._settings, "");


        this.onSettingsChanged();

    }

    /**
     * Updates query params to current settings
     */
    public getQueryParamString() {

        let result = "";

        let iterateProperties = function (obj, prefix) {
            for (let i in obj) {
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

    /*
     *
     */
    public applySettings(settings: Settings = this._settings){
        this.numberOfCalls++;
        let currentCalls = this.numberOfCalls;
        let _this=this;
        setTimeout(function(){
            if(currentCalls== _this.numberOfCalls){
                console.log(("load settings called"));
                _this.updateSettings(settings);
            }
            else{
                console.log("load settings avoided");
            }
        },500);
    }

    /**
     * Applies given settings. ignores map. this ensures to copy settings object and prevent side effects
     * @param {Settings} settings
     */
    public updateSettings(settings: Settings = this._settings) {

        this._settings.neutralColorRange.to = settings.neutralColorRange.to;
        this._settings.neutralColorRange.from = settings.neutralColorRange.from;
        this._settings.neutralColorRange.flipped = settings.neutralColorRange.flipped;

        this._settings.camera.x = settings.camera.x;
        this._settings.camera.y = settings.camera.y;
        this._settings.camera.z = settings.camera.z;

        this._settings.scaling.x = settings.scaling.x;
        this._settings.scaling.y = settings.scaling.y;
        this._settings.scaling.z = settings.scaling.z;

        this._settings.areaMetric = settings.areaMetric + "";
        this._settings.colorMetric = settings.colorMetric + "";
        this._settings.heightMetric = settings.heightMetric + "";

        this._settings.amountOfTopLabels = settings.amountOfTopLabels;
        this._settings.margin = settings.margin;
        this._settings.deltas = settings.deltas;
        this._settings.operation = settings.operation;
        this._settings.deltaColorFlipped = this.settings.deltaColorFlipped;
        this._settings.minimizeDetailPanel = settings.minimizeDetailPanel;
        this._settings.invertHeight = settings.invertHeight;

        //TODO what to do with map ? should it even be a part of settings ? deep copy of map ?
        this._settings.map = this.settings.map;

        this.onSettingsChanged();

    }

    //TODO return new copy ? this would need a change listener for angular...
    get settings(): Settings {
        return this._settings;
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