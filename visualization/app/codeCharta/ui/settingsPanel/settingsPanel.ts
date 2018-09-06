"use strict";
import "./settingsPanel.scss";
import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";

/**
 * Controls the settingsPanel
 */
export class SettingsPanelController implements SettingsServiceSubscriber {

    public showEdgePanel : boolean = false;

    /* @ngInject */
    constructor(
        private $scope,
        private $timeout,
        private settingsService: SettingsService) {

        this.settingsService.subscribe(this);
        this.onSettingsChanged(settingsService.settings, event);
    }

    private hasEdges() {
        let settings = this.settingsService.settings;

        if (settings.map && settings.map.edges) {
            return settings.map.edges.length > 0;
        }
        return false;
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
        this.showEdgePanel = this.hasEdges();
        this.settingsService.applySettings();
    }

}

export const settingsPanelComponent = {
    selector: "settingsPanelComponent",
    template: require("./settingsPanel.html"),
    controller: SettingsPanelController
};



