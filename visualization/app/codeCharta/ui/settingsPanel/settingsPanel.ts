"use strict";
import {STATISTIC_OPS, StatisticMapService} from "../../core/statistic/statistic.service";
import {SettingsService, Settings, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import {DataService, DataServiceSubscriber, DataModel} from "../../core/data/data.service";
import {TreeMapService} from "../../core/treemap/treemap.service";

/**
 * Controls the settingsPanel
 */
export class SettingsPanelController implements DataServiceSubscriber, SettingsServiceSubscriber{

    public settings: Settings;
    public sliderOptions: any;
    public metrics: string[];
    public data: DataModel;
    public STATISTIC_OPS = STATISTIC_OPS;

    /* @ngInject */
    constructor(
        private settingsService: SettingsService,
        private dataService: DataService,
        private treeMapService: TreeMapService
    ) {

        this.settings = settingsService.settings;
        this.data = dataService.data;
        this.STATISTIC_OPS = STATISTIC_OPS;

        const ctx = this;

        this.sliderOptions = {
            ceil: treeMapService.getMaxMetricInAllRevisions(settingsService.settings.colorMetric),
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
        this.sliderOptions.ceil = this.treeMapService.getMaxMetricInAllRevisions(settings.colorMetric);
    }

    /**
     * called on data change.
     * @param {DataModel} data
     */
    onDataChanged(data: DataModel) {
        this.metrics = this.sortStringArrayAlphabetically(data.metrics);
        this.onStatisticsChange();
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

    /**
     * Updates the map before broadcasting the update of the settings
     */
    onStatisticsChange(){
        this.settings.map = this.statisticMapService.unifyMaps(this.data, this.settings);
        this.notify();
    }

}

export const settingsPanelComponent = {
    selector: "settingsPanelComponent",
    template: require("./settingsPanel.html"),
    controller: SettingsPanelController
};



