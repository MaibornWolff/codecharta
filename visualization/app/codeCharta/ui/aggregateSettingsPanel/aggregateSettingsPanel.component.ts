import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import "./aggregateSettingsPanel.component.scss";
import {DataModel, DataService, DataServiceSubscriber} from "../../core/data/data.service";
import {CodeMap} from "../../core/data/model/CodeMap";
import {AggregateMapService} from "../../core/aggregate/aggregate.service";

export class AggregateSettingsPanelController implements DataServiceSubscriber, SettingsServiceSubscriber{

    public settings: Settings;
    public data: DataModel;
    public revisions: CodeMap[];
    public currentAggregation : number[];
    public aggregate : AggregateMapService;
    public mapsToAggregate : CodeMap[];

    /* @ngInject */
    constructor(
        private settingsService: SettingsService,
        private dataService: DataService,
    ) {
        this.revisions = dataService.data.revisions;
        this.settings = settingsService.settings;
        this.data = dataService.data;
        this.dataService.subscribe(this);
        this.settingsService.subscribe(this);
        this.mapsToAggregate = [];
    }

    onAggregateChange(){

        if(!this.currentAggregation){
            this.currentAggregation = [];
            let indexOfReferenceMap = this.dataService.getIndexOfMap(this.dataService.getReferenceMap(), this.revisions);
            this.currentAggregation.push(indexOfReferenceMap);
        }

        this.selectMapsToAggregate();
        console.log("mapsToAggregate", this.mapsToAggregate);

        this.aggregate.aggregateMaps(this.mapsToAggregate);
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
        this.mapsToAggregate = [];

        for(let position of this.currentAggregation){
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
