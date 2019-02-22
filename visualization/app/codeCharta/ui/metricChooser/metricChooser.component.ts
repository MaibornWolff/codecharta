import {SettingsService} from "../../core/settings/settings.service";
import {IAngularEvent, IRootScopeService} from "angular";
import "./metricChooser.component.scss";
import {
    CodeMapBuildingTransition, CodeMapMouseEventService,
    CodeMapMouseEventServiceSubscriber
} from "../codeMap/codeMap.mouseEvent.service";
import {CodeMapBuilding} from "../codeMap/rendering/codeMapBuilding";
import { ImportedFilesChangedSubscriber, CodeChartaService } from "../../codeCharta.service";
import { MetricData, CCFile } from "../../codeCharta.model";

export class MetricChooserController implements ImportedFilesChangedSubscriber, CodeMapMouseEventServiceSubscriber{

    public metricData: MetricData[];

    public hoveredAreaValue: number;
    public hoveredHeightValue: number;
    public hoveredColorValue: number;
    public hoveredHeightDelta: number;
    public hoveredAreaDelta: number;
    public hoveredColorDelta: number;
    public hoveredDeltaColor: string;
    public optionsWithoutStart;
    public sliderPositions;


    /* @ngInject */
    constructor(
        private settingsService: SettingsService,
        private $rootScope: IRootScopeService

    ) {
        //this.onDataChanged(dataService.data, null);
        CodeChartaService.subscribe(this.$rootScope, this);
        CodeMapMouseEventService.subscribe(this.$rootScope, this);
        this.optionsWithoutStart = {
            connect: true,
            range: {
                min: 0,
                max: 100,
            },
        };

        this.sliderPositions = [20, 80];
    }

    public onImportedFilesChanged(importedFiles: CCFile[], metrics: string[], metricData: MetricData[]) {
        this.metricData =  metricData;
    }

    public notify() {
        this.settingsService.applySettings();
    }

    public onBuildingRightClicked(building: CodeMapBuilding, x: number, y: number, event: IAngularEvent) {
        // unused
    }

    public onBuildingHovered(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {

        if(data && data.to && data.to.node && data.to.node.attributes) {
            this.hoveredAreaValue = data.to.node.attributes[this.settingsService.settings.dynamicSettings.areaMetric];
            this.hoveredColorValue = data.to.node.attributes[this.settingsService.settings.dynamicSettings.colorMetric];
            this.hoveredHeightValue = data.to.node.attributes[this.settingsService.settings.dynamicSettings.heightMetric];

            if(data.to.node.deltas){

                this.hoveredAreaDelta = data.to.node.deltas[this.settingsService.settings.dynamicSettings.areaMetric];
                this.hoveredColorDelta = data.to.node.deltas[this.settingsService.settings.dynamicSettings.colorMetric];
                this.hoveredHeightDelta = data.to.node.deltas[this.settingsService.settings.dynamicSettings.heightMetric];

                this.hoveredDeltaColor = this.getHoveredDeltaColor();
            }
            else {
                this.hoveredAreaDelta = null;
                this.hoveredColorDelta = null;
                this.hoveredHeightDelta = null;
                this.hoveredDeltaColor = null;
            }
        } else {
            this.hoveredAreaValue = null;
            this.hoveredColorValue = null;
            this.hoveredHeightValue = null;
            this.hoveredHeightDelta = null;
            this.hoveredAreaDelta = null;
            this.hoveredColorDelta = null;
        }
    }

    public onBuildingSelected(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {
        // unused
    }

    private getHoveredDeltaColor() {
        let colors = {
            0: "green",
            1: "red"
        };

        if (this.hoveredHeightDelta > 0) {
            return colors[Number(this.settingsService.settings.appSettings.deltaColorFlipped)];
        } else if (this.hoveredHeightDelta < 0) {
            return colors[Number(!this.settingsService.settings.appSettings.deltaColorFlipped)];
        } else {
            return "inherit";
        }
    }

}

export const areaMetricChooserComponent = {
    selector: "areaMetricChooserComponent",
    template: require("./metricChooser.area.component.html"),
    controller: MetricChooserController
};

export const heightMetricChooserComponent = {
    selector: "heightMetricChooserComponent",
    template: require("./metricChooser.height.component.html"),
    controller: MetricChooserController
};

export const colorMetricChooserComponent = {
    selector: "colorMetricChooserComponent",
    template: require("./metricChooser.color.component.html"),
    controller: MetricChooserController
};





