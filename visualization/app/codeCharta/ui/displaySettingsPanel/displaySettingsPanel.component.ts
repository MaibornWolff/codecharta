import {KindOfMap, Settings, SettingsService} from "../../core/settings/settings.service";
import "./displaySettingsPanel.component.scss";

export class DisplaySettingsPanelController {

    public viewModel = {
        flipped: false,
        deltas: false,
        deltaColorFlipped: false,
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
        this.viewModel.deltaColorFlipped = settings.deltaColorFlipped;
    }

    apply() {
        this.settingsService.settings.neutralColorRange.flipped = this.viewModel.flipped;
        this.settingsService.settings.deltaColorFlipped = this.viewModel.deltaColorFlipped;
        this.settingsService.onSettingsChanged();
    }

    public changeMargin(){
        this.settingsService.settings.dynamicMargin = false;
        this.settingsService.applySettings();
    }
}

export const displaySettingsPanelComponent = {
    selector: "displaySettingsPanelComponent",
    template: require("./displaySettingsPanel.component.html"),
    controller: DisplaySettingsPanelController
};



