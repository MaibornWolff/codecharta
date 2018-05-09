import "./aggregateSettingsPanel.component.scss";
export class AggregateSettingsPanelController {
    constructor(settingsService, dataService) {
        this.settingsService = settingsService;
        this.dataService = dataService;
        this.maps = dataService.data.revisions;
        this.settings = settingsService.settings;
        this.data = dataService.data;
        this.dataService.subscribe(this);
        this.settingsService.subscribe(this);
    }
    onAggregateChange() {
        this.settingsService.applySettings();
    }
    onDataChanged(data) {
        this.data = data;
        this.onAggregateChange();
    }
    onSettingsChanged(settings, event) {
        this.settings = settings;
    }
}
export const aggregateSettingsPanelComponent = {
    selector: "aggregateSettingsPanelComponent",
    template: require("./aggregateSettingsPanel.component.html"),
    controller: AggregateSettingsPanelController
};
//# sourceMappingURL=aggregateSettingsPanel.component.js.map