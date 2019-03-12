import {SettingsService, SettingsServiceSubscriber} from "../../state/settings.service";
import {IAngularEvent, IRootScopeService} from "angular";
import "./metricChooser.component.scss";
import {
    CodeMapBuildingTransition, CodeMapMouseEventService,
    CodeMapMouseEventServiceSubscriber
} from "../codeMap/codeMap.mouseEvent.service";
import {CodeMapBuilding} from "../codeMap/rendering/codeMapBuilding";
import {MetricData, CCFile, Settings, FileState, ColorRange, FileSelectionState} from "../../codeCharta.model";
import {FileStateService, FileStateServiceSubscriber} from "../../state/fileState.service";
import {MetricCalculator} from "../../MetricCalculator";

export class MetricChooserController implements FileStateServiceSubscriber, CodeMapMouseEventServiceSubscriber, SettingsServiceSubscriber {

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

    public _viewModel = {
        areaMetric: null,
        colorMetric: null,
        heightMetric: null
    }


    /* @ngInject */
    constructor(
        private settingsService: SettingsService,
        private $rootScope: IRootScopeService

    ) {
        //this.onDataChanged(dataService.data, null);
        FileStateService.subscribe(this.$rootScope, this);
        SettingsService.subscribe(this.$rootScope, this);
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


    public onSettingsChanged(settings: Settings, event: angular.IAngularEvent) {
        this.updateViewModel(settings)
    }


    public onFileSelectionStatesChanged(fileStates: FileState[], metricData: MetricData[], renderState: FileSelectionState, event: angular.IAngularEvent) {
        // unused
    }

    public onImportedFilesChanged(fileStates: FileState[], metricData: MetricData[], renderState: FileSelectionState, event: angular.IAngularEvent) {
        console.log("metricData", metricData)

        const metrics = metricData.map(x => x.name)
        this.metricData =  metricData;

        this.settingsService.updateSettings({
            dynamicSettings: {
                areaMetric: this.getMetricByIndexElseLast(0, metrics),
                heightMetric: this.getMetricByIndexElseLast(1, metrics),
                colorMetric: this.getMetricByIndexElseLast(2, metrics),
                neutralColorRange: this.getAdaptedRange(
                    fileStates.map(x => x.file),
                    this.getMetricByIndexElseLast( 2, metrics),
                    false)
            }
        })
    }

    // TODO: move getAdaptedRange into colorSettingsPanel and check if colorMetric changed
    private getAdaptedRange(files: CCFile[], colorMetric: string, flipped: boolean): ColorRange {
        const maxMetricValue = MetricCalculator.getMaxMetricInAllRevisions(files, colorMetric)
        const firstThird = Math.round((maxMetricValue / 3) * 100) / 100
        const secondThird = Math.round(firstThird * 2 * 100) / 100

        return {
            flipped: flipped,
            from: firstThird,
            to: secondThird
        }
    }

    private getMetricByIndexElseLast(index: number, metrics: string[]): string {
        return metrics[Math.min(index, metrics.length - 1)]
    }

    private updateViewModel(settings: Settings) {
        this._viewModel.areaMetric = settings.dynamicSettings.areaMetric
        this._viewModel.colorMetric = settings.dynamicSettings.colorMetric
        this._viewModel.heightMetric = settings.dynamicSettings.heightMetric
    }

    public applySettings() {
        this.settingsService.updateSettings({
            dynamicSettings: {
                areaMetric: this._viewModel.areaMetric,
                colorMetric: this._viewModel.colorMetric,
                heightMetric: this._viewModel.heightMetric
            }
        })
    }

    public onBuildingRightClicked(building: CodeMapBuilding, x: number, y: number, event: IAngularEvent) {
        // unused
    }

    public onBuildingHovered(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {

        if(data && data.to && data.to.node && data.to.node.attributes) {
            this.hoveredAreaValue = data.to.node.attributes[this._viewModel.areaMetric];
            this.hoveredColorValue = data.to.node.attributes[this._viewModel.colorMetric];
            this.hoveredHeightValue = data.to.node.attributes[this._viewModel.heightMetric];

            if(data.to.node.deltas){

                this.hoveredAreaDelta = data.to.node.deltas[this._viewModel.areaMetric];
                this.hoveredColorDelta = data.to.node.deltas[this._viewModel.colorMetric];
                this.hoveredHeightDelta = data.to.node.deltas[this._viewModel.heightMetric];

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
            return colors[Number(this.settingsService.getSettings().appSettings.deltaColorFlipped)];
        } else if (this.hoveredHeightDelta < 0) {
            return colors[Number(!this.settingsService.getSettings().appSettings.deltaColorFlipped)];
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





