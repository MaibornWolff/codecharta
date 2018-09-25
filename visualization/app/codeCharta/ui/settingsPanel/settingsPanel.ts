"use strict";
import "./settingsPanel.scss";

/**
 * Controls the settingsPanel
 */
export class SettingsPanelController {

    public showEdgePanel : boolean = false;

    /* @ngInject */
    constructor(
        private $scope,
        private $timeout) {
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



