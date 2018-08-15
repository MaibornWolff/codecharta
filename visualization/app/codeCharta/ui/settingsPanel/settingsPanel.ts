"use strict";
import "./settingsPanel.scss";
import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import {CodeMap} from "../../core/data/model/CodeMap";

/**
 * Controls the settingsPanel
 */
export class SettingsPanelController implements SettingsServiceSubscriber {

    public showTemporalCouplingPanel : boolean = false;

    /* @ngInject */
    constructor(
        private $scope,
        private $timeout,
        private settingsService: SettingsService) {

        this.onSettingsChanged(settingsService.settings);
        this.settingsService.subscribe(this);
    }

    onSettingsChanged(s: Settings) {
        this.showTemporalCouplingPanel = this.hasTemporalCouplingDependencies();
    }

    private hasTemporalCouplingDependencies() {

        let settings = this.settingsService.settings;

        if (settings.map &&
            settings.map.edges) {
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



}

export const settingsPanelComponent = {
    selector: "settingsPanelComponent",
    template: require("./settingsPanel.html"),
    controller: SettingsPanelController
};



