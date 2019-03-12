import "./heightSettingsPanel.component.scss";
import {IRootScopeService} from "angular";
import {SettingsService, SettingsServiceSubscriber} from "../../state/settings.service";
import {FileSelectionState, FileState, MetricData, Settings} from "../../codeCharta.model";
import {FileStateService} from "../../state/fileState.service";

export class HeightSettingsPanelController implements SettingsServiceSubscriber {

    private _viewModel: {
        amountOfTopLabels: number,
        scalingY: number,
        invertHeight: boolean,
        renderState: FileSelectionState,
        comparisonState: FileSelectionState
    } = {
        amountOfTopLabels: null,
        scalingY: null,
        invertHeight: null,
        renderState: null,
        comparisonState: FileSelectionState.Comparison
    }

    /* @ngInject */
    constructor(
        private $rootScope: IRootScopeService,
        private settingsService: SettingsService
    ) {
        SettingsService.subscribe(this.$rootScope, this);
    }

    public onSettingsChanged(settings: Settings, event: angular.IAngularEvent) {
        this._viewModel.amountOfTopLabels = settings.appSettings.amountOfTopLabels;
        this._viewModel.scalingY = settings.appSettings.scaling.y;
        this._viewModel.invertHeight = settings.appSettings.invertHeight;
    }

    public onFileSelectionStatesChanged(fileStates: FileState[], metricData: MetricData[], renderState: FileSelectionState, event: angular.IAngularEvent) {
        this._viewModel.renderState = FileStateService.getRenderState(fileStates);
    }

    public onImportedFilesChanged(fileStates: FileState[], metricData: MetricData[], renderState: FileSelectionState, event: angular.IAngularEvent) {

    }

    public applySettings() {
        this.settingsService.updateSettings({
            appSettings: {
                amountOfTopLabels: this._viewModel.amountOfTopLabels,
                invertHeight: this._viewModel.invertHeight,
                scaling: {
                    y: this._viewModel.scalingY
                }
            }
        })
    }

}

export const heightSettingsPanelComponent = {
    selector: "heightSettingsPanelComponent",
    template: require("./heightSettingsPanel.component.html"),
    controller: HeightSettingsPanelController
};