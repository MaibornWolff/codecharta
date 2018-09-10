"use strict";
import "./settingsPanel.scss";
import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";

/**
 * Controls the settingsPanel
 */
export class SettingsPanelController implements SettingsServiceSubscriber{

    /* @ngInject */
    constructor(
        private $scope,
        private $timeout,
        private settingsService: SettingsService
    ) {
        this.onSettingsChanged(this.settingsService.settings, null);
    }

    /**
     * This is necessary to update the rzSlider on panel expansion
     * @param $panel
     */
    collapseAndUpdateChildRzSlider($panel) {
        $panel.collapse();
        this.$timeout(() => {
            this.$scope.$broadcast("rzSliderForceRender");
        },50);
    }

    onSettingsChanged(settings: Settings, event: Event) {
        this.settingsService.applySettings();
    }

}

export const settingsPanelComponent = {
    selector: "settingsPanelComponent",
    template: require("./settingsPanel.html"),
    controller: SettingsPanelController
};



