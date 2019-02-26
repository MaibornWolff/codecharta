import {DataModel, DataService, DataServiceSubscriber} from "../data/data.service";
import {
    CameraChangeSubscriber,
    ThreeOrbitControlsService
} from "../../ui/codeMap/threeViewer/threeOrbitControlsService";
import {PerspectiveCamera} from "three";
import {CodeMap, CodeMapNode, BlacklistItem} from "../data/model/CodeMap";
import {hierarchy, HierarchyNode} from "d3-hierarchy";

export interface Range {
    from: number;
    to: number;
    flipped: boolean;
}

export interface Scale {
    x: number;
    y: number;
    z: number;
}

export enum KindOfMap {
    Single = "Single",
    Multiple = "Multiple",
    Delta = "Delta"
}

export interface MarkedPackage {
    path: string,
    color: string, // saved as "#FFFFFF"
    attributes: {[key: string]: any}
}

export interface Settings {

    map: CodeMap;
    neutralColorRange: Range;
    areaMetric: string;
    heightMetric: string;
    colorMetric: string;
    mode: KindOfMap;
    amountOfTopLabels: number;
    scaling: Scale;
    camera: Scale;
    margin: number;
    deltaColorFlipped: boolean;
    enableEdgeArrows: boolean;
    hideFlatBuildings: boolean;
    maximizeDetailPanel: boolean;
    invertHeight: boolean;
    dynamicMargin: boolean;
    isWhiteBackground: boolean;
    whiteColorBuildings: boolean;
    blacklist: Array<BlacklistItem>;
    markedPackages: Array<MarkedPackage>;
    focusedNodePath: string;
    searchedNodePaths: Array<string>;
    searchPattern: string;
}

export interface SettingsServiceSubscriber {
    onSettingsChanged(settings: Settings, event: Event);
}

export class SettingsService implements DataServiceSubscriber, CameraChangeSubscriber {

    //TODO return new copy ? this would need a change listener for angular...
    get settings(): Settings {
        return this._settings;
    }

    public static SELECTOR = "settingsService";
    public static MARGIN_FACTOR = 4;
    private static MIN_MARGIN = 15;
    private static MAX_MARGIN = 100;

    public numberOfCalls: number;

    private _settings: Settings;

    private _lastDeltaState = false;
    private _lastColorMetric = "";

    /* ngInject */
    constructor(private urlService, private dataService: DataService, private $rootScope,
                private threeOrbitControlsService: ThreeOrbitControlsService) {

        this._settings = this.getDefaultSettings();

        this.numberOfCalls = 0;
        this.dataService.subscribe(this);
        this.threeOrbitControlsService.subscribe(this);

    }

    public subscribe(subscriber: SettingsServiceSubscriber) {
        this.$rootScope.$on("settings-changed", (event, data) => {
            subscriber.onSettingsChanged(data, event);
        });
    }

    public getDefaultSettings(): Settings {

        let range: Range = {
            from: null,
            to: null,
            flipped: false
        };

        let scaling: Scale = {
            x: 1, y: 1, z: 1
        };

        let camera: Scale = {
            x: 0, y: 300, z: 1000
        };

        this._lastDeltaState = false;

        let settings: Settings = {
            map: this.dataService.data.renderMap,
            neutralColorRange: range,
            areaMetric: this.getMetricByIdOrLast(0, this.dataService.data.metrics),
            heightMetric: this.getMetricByIdOrLast(1, this.dataService.data.metrics),
            colorMetric: this.getMetricByIdOrLast(2, this.dataService.data.metrics),
            mode: KindOfMap.Single,
            amountOfTopLabels: 1,
            scaling: scaling,
            camera: camera,
            margin: SettingsService.MIN_MARGIN,
            deltaColorFlipped: false,
            enableEdgeArrows: true,
            hideFlatBuildings: true,
            maximizeDetailPanel: false,
            invertHeight: false,
            dynamicMargin: true,
            isWhiteBackground: false,
            whiteColorBuildings: false,
            blacklist: [],
            markedPackages: [],
            focusedNodePath: null,
            searchedNodePaths: [],
            searchPattern: null
        };

        settings.margin = this.computeMargin(settings);
        settings.neutralColorRange = this.getAdaptedRange(settings);
        settings.neutralColorRange.flipped = false;
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

        if(data.metrics && data.renderMap && data.revisions) {
            this._settings.map = data.renderMap; // reference map is always the map which should be drawn
            this._settings.blacklist = data.renderMap.blacklist;

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

    }

    public onCameraChanged(camera: PerspectiveCamera) {
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
    private onSettingsChanged() {

        if (this._lastDeltaState && this._settings.mode != KindOfMap.Delta) {
            this._lastDeltaState = false;
            this.onDeactivateDeltas();
        } else if (!this._lastDeltaState && this._settings.mode == KindOfMap.Delta) {
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

        let iterateProperties = (obj, prefix) => {
            for (let i in obj) {
                if (obj.hasOwnProperty(i) && i !== "map" && i) {

                    if (typeof obj[i] === "string" || obj[i] instanceof String) {
                        //do not iterate over strings
                    } else {
                        iterateProperties(obj[i], i + ".");
                    }

                    const res = this.urlService.getParam(prefix + i);

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
     * Computes the margin applied to a scenario related the square root of (the area divided
     * by the number of buildings)
     */
    public computeMargin(s: Settings = this.settings): number {
        if (s.map !== null && s.dynamicMargin) {
            let leaves = hierarchy<CodeMapNode>(s.map.nodes).leaves();
            let numberOfBuildings = 0;
            let totalArea = 0;

            leaves.forEach((node: HierarchyNode<CodeMapNode>) => {
                numberOfBuildings++;
                if(node.data.attributes && node.data.attributes[s.areaMetric]){
                    totalArea += node.data.attributes[s.areaMetric];
                }
            });

            let margin: number = SettingsService.MARGIN_FACTOR * Math.round(Math.sqrt((totalArea / numberOfBuildings)));
            return Math.min(SettingsService.MAX_MARGIN, Math.max(SettingsService.MIN_MARGIN, margin));
        } else {
            return s.margin;
        }
    }

    private getAdaptedRange(s: Settings = this.settings): Range {
        const maxMetricValue =  this.dataService.getMaxMetricInAllRevisions(s.colorMetric);
        const firstThird = Math.round((maxMetricValue / 3) * 100) / 100;
        const secondThird = Math.round(firstThird * 2 * 100) / 100;

        return {
           flipped: s.neutralColorRange.flipped,
           from: firstThird,
           to: secondThird,
        }
    }


    /**
     * Updates query params to current settings
     */
    public getQueryParamString() {

        let result = "";

        let iterateProperties = (obj, prefix) => {
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

    /**
     * Avoids the excesive calling of updateSettings with standard settings in order to increase the efficiency
     * When the function is called with an argument it calls updateSettings in order to avoid the lost of the information
     * contained in that argument.
     *
     * @param {Settings} settings
     */
    public applySettings(settings?: Settings) {
        if (settings) {
            this.potentiallyUpdateColorRange(settings);
            this._settings.margin = this.computeMargin(settings);
            this.updateSettings(settings);

        } else {
            this.potentiallyUpdateColorRange();
            this._settings.margin = this.computeMargin();
            this.numberOfCalls++;
            if (this.numberOfCalls > 4) {
                this.numberOfCalls = 0;
                this.onSettingsChanged();
            } else {
                let currentCalls = this.numberOfCalls;
                let _this = this;

                setTimeout(function () {
                    if (currentCalls == _this.numberOfCalls) {
                        this.numberOfCalls = 0;
                        _this.onSettingsChanged();
                    }
                }, 400);
            }
        }
    }

    private potentiallyUpdateColorRange(s: Settings = this.settings) {
        if (this._lastColorMetric != s.colorMetric) {
            this._lastColorMetric = s.colorMetric;
            this._settings.neutralColorRange = this.getAdaptedRange(s);
        }
    }

    /**
     * Applies given settings. ignores map. this ensures to copy settings object and prevent side effects
     * @param {Settings} settings
     */
    private updateSettings(settings: Settings) {
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
        this._settings.mode = settings.mode;
        this._settings.deltaColorFlipped = settings.deltaColorFlipped;
        this._settings.enableEdgeArrows = settings.enableEdgeArrows;
        this._settings.hideFlatBuildings = settings.hideFlatBuildings;
        this._settings.maximizeDetailPanel = settings.maximizeDetailPanel;
        this._settings.invertHeight = settings.invertHeight;
        this._settings.dynamicMargin = settings.dynamicMargin;
        this._settings.isWhiteBackground = settings.isWhiteBackground;
        this._settings.whiteColorBuildings = settings.whiteColorBuildings;
        this._settings.blacklist = settings.blacklist;
        this._settings.markedPackages = settings.markedPackages;
        this._settings.focusedNodePath = settings.focusedNodePath;
        this._settings.searchedNodePaths = settings.searchedNodePaths;
        this._settings.searchPattern = settings.searchPattern;

        //TODO what to do with map ? should it even be a part of settings ? deep copy of map ?
        this._settings.map = settings.map || this.settings.map;

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

}