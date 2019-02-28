import "./heightSettingsPanel.component.scss";
import {IRootScopeService} from "angular";
import {SettingsService} from "../../core/settings/settings.service";
import {RenderMode, Settings} from "../../codeCharta.model";

export class HeightSettingsPanelController {

    private _deltaMode = RenderMode.Delta;
    private _viewModel = {
        amountOfTopLabels: null,
        scalingY: null,
        invertHeight: null,
        renderMode: null
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
        this._viewModel.renderMode = settings.dynamicSettings.renderMode;
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