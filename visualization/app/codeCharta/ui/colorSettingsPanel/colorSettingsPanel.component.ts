import {SettingsService, SettingsServiceSubscriber} from "../../state/settings.service";
import "./colorSettingsPanel.component.scss";
import {CCFile, FileSelectionState, FileState, MetricData, Settings} from "../../codeCharta.model";
import {IRootScopeService} from "angular";
import {FileStateService, FileStateServiceSubscriber} from "../../state/fileState.service";
import {MetricCalculator} from "../../util/metricCalculator";

export class ColorSettingsPanelController implements SettingsServiceSubscriber, FileStateServiceSubscriber {

    private lastColorMetric = null;

    private _viewModel: {
        neutralColorRangeFlipped: boolean,
        deltaColorFlipped: boolean,
        whiteColorBuildings: boolean,
        renderState: FileSelectionState,
        comparisonState: FileSelectionState
    } = {
        neutralColorRangeFlipped: null,
        deltaColorFlipped: null,
        whiteColorBuildings: null,
        renderState: null,
        comparisonState: FileSelectionState.Comparison
    };

    /* @ngInject */
    constructor(
        private $rootScope: IRootScopeService,
        private settingsService: SettingsService,
        private fileStateService: FileStateService
    ) {
        SettingsService.subscribe(this.$rootScope, this);
        FileStateService.subscribe(this.$rootScope, this);
    }

    public onSettingsChanged(settings: Settings, event: angular.IAngularEvent) {
        this._viewModel.deltaColorFlipped = settings.appSettings.deltaColorFlipped;
        this._viewModel.whiteColorBuildings = settings.appSettings.whiteColorBuildings;

        if (this.lastColorMetric != settings.dynamicSettings.colorMetric) {
            this.lastColorMetric = settings.dynamicSettings.colorMetric
            this.adaptedColorRange(settings)
        } else {
            this._viewModel.neutralColorRangeFlipped = settings.dynamicSettings.neutralColorRange.flipped;
        }
    }

    public onFileSelectionStatesChanged(fileStates: FileState[], metricData: MetricData[], renderState: FileSelectionState, event: angular.IAngularEvent) {
        this._viewModel.renderState = FileStateService.getRenderState(fileStates);
    }

    public onImportedFilesChanged(fileStates: FileState[], metricData: MetricData[], renderState: FileSelectionState, event: angular.IAngularEvent) {

    }

    public applySettings() {
        this.settingsService.updateSettings({
            dynamicSettings: {
                neutralColorRange: {
                    flipped: this._viewModel.neutralColorRangeFlipped
                }
            },
            appSettings: {
                deltaColorFlipped: this._viewModel.deltaColorFlipped,
                whiteColorBuildings: this._viewModel.whiteColorBuildings
            }
        })
    }

    private adaptedColorRange(s: Settings) {
        const maxMetricValue = MetricCalculator.getMaxMetricInAllRevisions(
            this.fileStateService.getVisibleFiles(),
            s.dynamicSettings.colorMetric
        )

        const flipped = (s.dynamicSettings.neutralColorRange) ? s.dynamicSettings.neutralColorRange.flipped : false
        const firstThird = Math.round((maxMetricValue / 3) * 100) / 100
        const secondThird = Math.round(firstThird * 2 * 100) / 100

        this.settingsService.updateSettings({
            dynamicSettings: {
                neutralColorRange: {
                    flipped: flipped,
                    from: firstThird,
                    to: secondThird
                }
            }
        })
    }

}

export const colorSettingsPanelComponent = {
    selector: "colorSettingsPanelComponent",
    template: require("./colorSettingsPanel.component.html"),
    controller: ColorSettingsPanelController
};



