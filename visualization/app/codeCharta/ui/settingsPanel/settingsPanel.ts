"use strict";
import "./settingsPanel.scss";
import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import $ from "jquery";

/**
 * Controls the settingsPanel
 */
export class SettingsPanelController implements SettingsServiceSubscriber {

    public viewModel = {
        blacklistLength: 0
    };

    /* @ngInject */
    constructor(
        private $scope,
        private $timeout,
        private settingsService: SettingsService) {

        settingsService.subscribe(this);
        this.onSettingsChanged(this.settingsService.settings, null);
    }

    /**
     * This is necessary to update the rzSlider on panel expansion
     * @param $panel
     */
    public collapseAndUpdateChildRzSlider($panel) {
        $panel.collapse();
        this.$timeout(() => {
            this.$scope.$broadcast("rzSliderForceRender");
        },50);
    }

    public onSettingsChanged(settings: Settings, event: Event) {
        if (settings.blacklist.length != this.viewModel.blacklistLength) {
            this.highlightCounterIcon();
        }
        this.viewModel.blacklistLength = settings.blacklist.length;
    }

    public highlightCounterIcon() {
        const panelElement = $(".item-counter").closest("md-expansion-panel");
        panelElement.addClass("highlight");

        this.$timeout(() => {
            panelElement.removeClass("highlight");
        },200);
    }

}

export const settingsPanelComponent = {
    selector: "settingsPanelComponent",
    template: require("./settingsPanel.html"),
    controller: SettingsPanelController
};



