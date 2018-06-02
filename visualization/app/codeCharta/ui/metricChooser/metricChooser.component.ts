import {DataServiceSubscriber, DataService, DataModel} from "../../core/data/data.service";
import {SettingsService} from "../../core/settings/settings.service";
import {IAngularEvent, IRootScopeService} from "angular";
import "./metricChooser.component.scss";
import {
    CodeMapBuildingTransition, CodeMapMouseEventService,
    CodeMapMouseEventServiceSubscriber
} from "../codeMap/codeMap.mouseEvent.service";
import {codeMapBuilding} from "../codeMap/rendering/codeMapBuilding";

export class MetricChooserController implements DataServiceSubscriber, CodeMapMouseEventServiceSubscriber{

    public metrics: string[];

    public hoveredAreaValue: number;
    public hoveredHeightValue: number;
    public hoveredColorValue: number;

    /* @ngInject */
    constructor(
        private dataService: DataService,
        private settingsService: SettingsService,
        private $rootScope: IRootScopeService
    ) {
        this.metrics = dataService.data.metrics.sort();
        this.dataService.subscribe(this);
        CodeMapMouseEventService.subscribe($rootScope, this);
    }

    onDataChanged(data: DataModel, event: IAngularEvent) {
        this.metrics = data.metrics.sort();
    }

    public notify() {
        this.settingsService.applySettings();
    }

    onBuildingRightClicked(building: codeMapBuilding, x: number, y: number, event: IAngularEvent) {
    }

    onBuildingHovered(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {
        if(data && data.to && data.to.node && data.to.node.attributes) {
            this.hoveredAreaValue = data.to.node.attributes[this.settingsService.settings.areaMetric];
            this.hoveredColorValue = data.to.node.attributes[this.settingsService.settings.colorMetric];
            this.hoveredHeightValue = data.to.node.attributes[this.settingsService.settings.heightMetric];
        } else {
            this.hoveredAreaValue = null;
            this.hoveredColorValue = null;
            this.hoveredHeightValue = null;
        }
    }

    onBuildingSelected(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {
    }

}

export const metricChooserComponent = {
    selector: "metricChooserComponent",
    template: require("./metricChooser.component.html"),
    controller: MetricChooserController
};

export const horizontalMetricChooserComponent = {
    selector: "horizontalMetricChooserComponent",
    template: require("./metricChooser.horizontal.component.html"),
    controller: MetricChooserController
};




