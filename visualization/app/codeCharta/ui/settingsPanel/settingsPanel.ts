"use strict";
import {STATISTIC_OPS, StatisticMapService} from "../../core/statistic/statistic.service";
import {SettingsService, Settings, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import {DataService, DataServiceSubscriber, DataModel} from "../../core/data/data.service";
import {TreeMapService} from "../../core/treemap/treemap.service";
import "./settingsPanel.scss";

/**
 * Controls the settingsPanel
 */
export class SettingsPanelController implements DataServiceSubscriber, SettingsServiceSubscriber{

    public settings: Settings;
    public metrics: string[];
    public data: DataModel;
    public STATISTIC_OPS = STATISTIC_OPS;


    /* @ngInject */
    constructor(
        private settingsService: SettingsService,
        private dataService: DataService,
        private statisticMapService: StatisticMapService
    ) {

        this.settings = settingsService.settings;
        this.data = dataService.data;
        this.STATISTIC_OPS = STATISTIC_OPS;

        this.metrics = this.sortStringArrayAlphabetically(dataService.data.metrics);

        this.dataService.subscribe(this);
        this.settingsService.subscribe(this);

    }

    /**
     * called on data change.
     * @param {DataModel} data
     */
    onDataChanged(data: DataModel) {
        this.metrics = this.sortStringArrayAlphabetically(data.metrics);
        this.onStatisticsChange();
    }

    onSettingsChanged(settings: Settings, event: Event) {
        this.settings = settings;
    }

    /**
     * Notifies the settings service about changes.
     */
    notify() {
        this.settingsService.applySettings();
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



