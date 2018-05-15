import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import "./aggregateSettingsPanel.component.scss";
import {DataModel, DataService, DataServiceSubscriber} from "../../core/data/data.service";
import {CodeMap} from "../../core/data/model/CodeMap";
import {AggregateMapService} from "../../core/aggregate/aggregate.service";

export class AggregateSettingsPanelController implements DataServiceSubscriber, SettingsServiceSubscriber{

    public settings: Settings;
    public data: DataModel;
    public revisions: CodeMap[];
    public selectedMapIndices : number[];
    public aggregate : AggregateMapService;
    public mapsToAggregate : CodeMap[];

    /* @ngInject */
    constructor(
        private settingsService: SettingsService,
        private dataService: DataService,
        private aggregateMapService: AggregateMapService
    ) {
        this.revisions = dataService.data.revisions;
        this.settings = settingsService.settings;
        this.data = dataService.data;
        this.dataService.subscribe(this);
        this.settingsService.subscribe(this);
        this.mapsToAggregate = [] as CodeMap[];
        this.aggregate = aggregateMapService;
    }

    onAggregateChange(){

        if(!this.selectedMapIndices){
            this.selectedMapIndices = [];
            let indexOfReferenceMap = this.dataService.getIndexOfMap(this.dataService.getReferenceMap(), this.revisions);
            this.selectedMapIndices.push(indexOfReferenceMap);
        }

        this.selectMapsToAggregate();

        this.settings.map = this.aggregate.aggregateMaps(this.mapsToAggregate);
        console.log("map",this.settings.map);
        this.settingsService.applySettings();
    }

    onDataChanged(data: DataModel) {
        this.data = data;
        this.onAggregateChange();
    }

    onSettingsChanged(settings: Settings, event: Event) {
        this.settings = settings;
    }


    selectMapsToAggregate(){
        this.mapsToAggregate = [] as CodeMap[];

        for(let position of this.selectedMapIndices){
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
