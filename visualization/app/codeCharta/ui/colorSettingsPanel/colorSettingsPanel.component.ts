import {SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import "./colorSettingsPanel.component.scss";
import {RenderMode, Settings} from "../../codeCharta.model";
import {IRootScopeService} from "angular";

export class ColorSettingsPanelController implements SettingsServiceSubscriber {

    private _deltaMode = RenderMode.Delta;
    private _viewModel = {
        neutralColorRangeFlipped: null,
        deltaColorFlipped: null,
        whiteColorBuildings: null,
        mode: null
    };

    /* @ngInject */
    constructor(
        private $rootScope: IRootScopeService,
        private settingsService: SettingsService
    ) {
        SettingsService.subscribe(this.$rootScope, this);
    }

    public onSettingsChanged(settings: Settings, event: angular.IAngularEvent) {
        this._viewModel.neutralColorRangeFlipped = settings.dynamicSettings.neutralColorRange.flipped;
        this._viewModel.deltaColorFlipped = settings.appSettings.deltaColorFlipped;
        this._viewModel.whiteColorBuildings = settings.appSettings.whiteColorBuildings;
        this._viewModel.mode = settings.dynamicSettings.renderMode;
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

}

export const colorSettingsPanelComponent = {
    selector: "colorSettingsPanelComponent",
    template: require("./colorSettingsPanel.component.html"),
    controller: ColorSettingsPanelController
};



