"use strict";
import {SettingsService, Settings, SettingsServiceSubscriber} from "../../core/settings/settingsService";
import {DataService, DataServiceSubscriber, DataModel} from "../../core/data/dataService";
import {TreeMapService} from "../../core/treemap/treeMapService";

/**
 * Controls the settingsPanel
 */
export class SettingsPanelController implements DataServiceSubscriber, SettingsServiceSubscriber{

    public settings: Settings;
    public sliderOptions: any;
    public metrics: string[];

    /* @ngInject */
    constructor(
        private settingsService: SettingsService,
        private dataService: DataService,
        private treeMapService: TreeMapService
    ) {

        this.settings = settingsService.settings;

        const ctx = this;

        this.sliderOptions = {
            ceil: treeMapService.getMaxNodeHeightInAllRevisions(settingsService.settings.colorMetric),
            pushRange: true,
            onChange: ctx.notify.bind(ctx)
        };

        this.metrics = this.sortStringArrayAlphabetically(dataService.data.metrics);

        this.dataService.subscribe(this);
        this.settingsService.subscribe(this);

    }

    showUrlParams() {
        window.prompt("Copy to clipboard: Ctrl+C", this.settingsService.getQueryParamString());
    }

    /**
     * called on settings change.
     * @param {Settings} settings
     */
    onSettingsChanged(settings: Settings) {
        this.sliderOptions.ceil = this.treeMapService.getMaxNodeHeightInAllRevisions(settings.colorMetric);
    }

    /**
     * called on data change.
     * @param {DataModel} data
     */
    onDataChanged(data: DataModel) {
        this.metrics = this.sortStringArrayAlphabetically(data.metrics);
    }

    /**
     * Notifies the settings service about changes.
     */
    notify() {
        this.settingsService.onSettingsChanged();
    }

    /**
     * Sorts a simple string array in alphabetic order.
     * @param {string[]} arr
     * @returns {string[]} sortedArr
     */
    sortStringArrayAlphabetically(arr: string[]): string[] {
        return arr.sort();
    }

}

export const settingsPanelComponent = {
    selector: "settingsPanelComponent",
    template: require("./settingsPanel.html"),
    controller: SettingsPanelController
};



