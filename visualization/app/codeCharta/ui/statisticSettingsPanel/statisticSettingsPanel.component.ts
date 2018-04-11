import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import "./statisticSettingsPanel.component.scss";
import {STATISTIC_OPS, StatisticMapService} from "../../core/statistic/statistic.service";
import {DataModel, DataService, DataServiceSubscriber} from "../../core/data/data.service";

export class StatisticSettingsPanelController implements DataServiceSubscriber, SettingsServiceSubscriber{

    public STATISTIC_OPS = STATISTIC_OPS;
    public settings: Settings;
    public data: DataModel;

    /* @ngInject */
    constructor(
        private settingsService: SettingsService,
        private statisticMapService: StatisticMapService,
        private dataService: DataService,
    ) {
        this.settings = settingsService.settings;
        this.data = dataService.data;
        this.dataService.subscribe(this);
        this.settingsService.subscribe(this);
    }

    toLowerCaseButFirst(word: string): string{
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }

    onStatisticsChange(){
        this.settings.map = this.statisticMapService.unifyMaps(this.data, this.settings);
        this.settingsService.applySettings();
    }

    onDataChanged(data: DataModel) {
        this.data = data;
        this.onStatisticsChange();
    }

    onSettingsChanged(settings: Settings, event: Event) {
        this.settings = settings;
    }

}

export const statisticSettingsPanelComponent = {
    selector: "statisticSettingsPanelComponent",
    template: require("./statisticSettingsPanel.component.html"),
    controller: StatisticSettingsPanelController
};



