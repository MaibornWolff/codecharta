import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import "./aggregateSettingsPanel.component.scss";
import {DataModel, DataService, DataServiceSubscriber} from "../../core/data/data.service";

export class AggregateSettingsPanelController implements DataServiceSubscriber, SettingsServiceSubscriber{

    public settings: Settings;
    public data: DataModel;

    /* @ngInject */
    constructor(
        private settingsService: SettingsService,
        private dataService: DataService,
    ) {
        this.settings = settingsService.settings;
        this.data = dataService.data;
        this.dataService.subscribe(this);
        this.settingsService.subscribe(this);
    }

    onAggregateChange(){
        this.settingsService.applySettings();
    }

    onDataChanged(data: DataModel) {
        this.data = data;
        this.onAggregateChange();
    }

    onSettingsChanged(settings: Settings, event: Event) {
        this.settings = settings;
    }

}

export const aggregateSettingsPanelComponent = {
    selector: "aggregateSettingsPanelComponent",
    template: require("./aggregateSettingsPanel.component.html"),
    controller: AggregateSettingsPanelController
};
