import {SettingsService, SettingsServiceSubscriber} from "../../state/settings.service";
import {IAngularEvent, IRootScopeService, ITimeoutService} from "angular";
import "./metricChooser.component.scss";
import {
    CodeMapBuildingTransition, CodeMapMouseEventService,
    CodeMapMouseEventServiceSubscriber
} from "../codeMap/codeMap.mouseEvent.service";
import {CodeMapBuilding} from "../codeMap/rendering/codeMapBuilding";
import {
    MetricData,
    Settings,
    DynamicSettings, RecursivePartial
} from "../../codeCharta.model";
import {MetricStateService, MetricStateServiceSubscriber} from "../../state/metricState.service";

export class MetricChooserController implements MetricStateServiceSubscriber, CodeMapMouseEventServiceSubscriber, SettingsServiceSubscriber {

    public hoveredAreaValue: number;
    public hoveredHeightValue: number;
    public hoveredColorValue: number;
    public hoveredHeightDelta: number;
    public hoveredAreaDelta: number;
    public hoveredColorDelta: number;
    public hoveredDeltaColor: string;
    public optionsWithoutStart;
    public sliderPositions;

    private _viewModel: {
        metricData: MetricData[],
        areaMetric: string,
        colorMetric: string,
        heightMetric: string
    } = {
        metricData: [],
        areaMetric: null,
        colorMetric: null,
        heightMetric: null
    }


    /* @ngInject */
    constructor(
        private settingsService: SettingsService,
        private $rootScope: IRootScopeService

    ) {
        SettingsService.subscribe(this.$rootScope, this);
        CodeMapMouseEventService.subscribe(this.$rootScope, this);
        MetricStateService.subscribe(this.$rootScope, this)
        this.initSliderOptions()
    }

    private initSliderOptions() {
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

    public onMetricDataChanged(metricData: MetricData[], event: angular.IAngularEvent) {
        this._viewModel.metricData = metricData
        this.potentiallyUpdateChosenMetrics(metricData)
    }

    private potentiallyUpdateChosenMetrics(metricData: MetricData[]) {
        const metricKeys: Partial<DynamicSettings> = {
            areaMetric: "areaMetric",
            heightMetric: "heightMetric",
            colorMetric: "colorMetric"
        }
        let settingsUpdate: RecursivePartial<Settings> = this.prepareSettingsUpdateWithMetrics(metricKeys, metricData)
        if (Object.keys(settingsUpdate.dynamicSettings).length !== 0) {
            this.settingsService.updateSettings(settingsUpdate)
        }
    }

    private prepareSettingsUpdateWithMetrics(metricKeys: Partial<DynamicSettings>, metricData: MetricData[]): RecursivePartial<Settings>  {
        let settingsUpdate = {dynamicSettings: {}}

        let metricSelectionIndex = 0
        for (const metricKey in metricKeys) {
            const metricValue: string = this.settingsService.getSettings().dynamicSettings[metricKey]
            const availableMetrics: MetricData[] = metricData.filter(x => x.availableInVisibleMaps)

            if (availableMetrics && !availableMetrics.find(x => x.name == metricValue)) {
                settingsUpdate.dynamicSettings[metricKey] = availableMetrics[Math.min(metricSelectionIndex, availableMetrics.length - 1)].name
            }
            metricSelectionIndex++
        }
        return settingsUpdate
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





