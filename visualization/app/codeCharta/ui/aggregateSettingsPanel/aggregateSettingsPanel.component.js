import "./aggregateSettingsPanel.component.scss";
export class AggregateSettingsPanelController {
    constructor($rootScope, settingsService, dataService, aggregateMapService) {
        this.$rootScope = $rootScope;
        this.settingsService = settingsService;
        this.dataService = dataService;
        this.aggregateMapService = aggregateMapService;
        this.revisions = dataService.data.revisions;
        this.settings = settingsService.settings;
        this.data = dataService.data;
        this.dataService.subscribe(this);
        this.settingsService.subscribe(this);
        this.mapsToAggregate = [];
        this.aggregate = aggregateMapService;
    }
    onAggregateChange() {
        if (!this.selectedMapIndices) {
            this.selectedMapIndices = [];
            let indexOfReferenceMap = this.dataService.getIndexOfMap(this.dataService.getReferenceMap(), this.revisions);
            this.selectedMapIndices.push(indexOfReferenceMap);
        }
        this.selectMapsToAggregate();
        let newMap = this.aggregate.aggregateMaps(JSON.parse(JSON.stringify(this.mapsToAggregate)));
        console.log("New Map", newMap);
        this.settings.map = newMap;
        this.settingsService.applySettings(this.settings);
    }
    onDataChanged(data) {
        this.data = data;
        this.revisions = data.revisions;
        this.onAggregateChange();
    }
    onSettingsChanged(settings, event) {
        this.settings = settings;
    }
    selectMapsToAggregate() {
        this.mapsToAggregate = [];
        for (let position of this.selectedMapIndices) {
            let currentCodeMap = this.revisions[position];
            this.mapsToAggregate.push(currentCodeMap);
        }
    }
}
export const aggregateSettingsPanelComponent = {
    selector: "aggregateSettingsPanelComponent",
    template: require("./aggregateSettingsPanel.component.html"),
    controller: AggregateSettingsPanelController
};
//# sourceMappingURL=aggregateSettingsPanel.component.js.map