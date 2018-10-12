import {KindOfMap, Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import "./colorSettingsPanel.component.scss";

export class ColorSettingsPanelController implements SettingsServiceSubscriber{

    public viewModel = {
        flipped: false,
        deltas: false
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
        this.viewModel.deltas = settings.mode == KindOfMap.Delta;
    }

    apply() {
        this.settingsService.settings.neutralColorRange.flipped = this.viewModel.flipped;
        this.settingsService.onSettingsChanged();
    }

}

export const colorSettingsPanelComponent = {
    selector: "colorSettingsPanelComponent",
    template: require("./colorSettingsPanel.component.html"),
    controller: ColorSettingsPanelController
};



