import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import "./colorSettingsPanel.component.scss";

export class ColorSettingsPanelController implements SettingsServiceSubscriber{

    public viewModel = {
        flipped: false,
        deltas: false,
        deltaColorFlipped: false,
        backgroundFlipped: false
    };

    /* @ngInject */
    constructor(
        private settingsService: SettingsService
    ) {
        this.onSettingsChanged(this.settingsService.settings, null);
        this.settingsService.subscribe(this);
    }

    onSettingsChanged(settings: Settings, event) {
        this.viewModel.flipped = settings.neutralColorRange.flipped;
        this.viewModel.deltas = settings.deltas;
        this.viewModel.deltaColorFlipped = settings.deltaColorFlipped;
        this.viewModel.backgroundFlipped = settings.isWhiteBackground;
    }

    apply() {
        this.settingsService.settings.neutralColorRange.flipped = this.viewModel.flipped;
        this.settingsService.settings.deltaColorFlipped = this.viewModel.deltaColorFlipped;
        this.settingsService.settings.isWhiteBackground = this.viewModel.backgroundFlipped;
        this.settingsService.onSettingsChanged();
    }

}

export const colorSettingsPanelComponent = {
    selector: "colorSettingsPanelComponent",
    template: require("./colorSettingsPanel.component.html"),
    controller: ColorSettingsPanelController
};



