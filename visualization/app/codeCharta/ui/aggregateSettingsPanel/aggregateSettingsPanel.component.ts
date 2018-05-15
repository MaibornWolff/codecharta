import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import "./aggregateSettingsPanel.component.scss";
import {DataModel, DataService, DataServiceSubscriber} from "../../core/data/data.service";
import {CodeMap} from "../../core/data/model/CodeMap";
//import {AggregateMapService} from "../../core/aggregate/aggregate.service";

export class AggregateSettingsPanelController implements DataServiceSubscriber, SettingsServiceSubscriber{

    public settings: Settings;
    public data: DataModel;
    public revisions: CodeMap[];
    public currentAggregation : Number[];
    //public aggregate : AggregateMapService;
    public chosenMaps : CodeMap[];

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
        console.log(this.dataService.getIndexOfMap(
            this.dataService.getComparisonMap(), this.revisions));
        if(!this.currentAggregation){
            this.currentAggregation = [];
            this.currentAggregation.push(this.dataService.getIndexOfMap(
                this.dataService.getComparisonMap(), this.revisions));
        }
        //this.selectMaps();
    }

    onAggregateChange(){
        //Call backend code here
        this.selectMaps();
        console.log("Maps", this.revisions);
        //this.aggregate.aggregateMaps(this.chosenMaps);
        this.settingsService.applySettings();
    }

    onDataChanged(data: DataModel) {
        this.data = data;
        this.onAggregateChange();
    }

    onSettingsChanged(settings: Settings, event: Event) {
        this.settings = settings;
    }


    selectMaps(){
        for(let position in this.currentAggregation){
            this.chosenMaps.push(this.revisions[position]);
        }
    }

}

export const aggregateSettingsPanelComponent = {
    selector: "aggregateSettingsPanelComponent",
    template: require("./aggregateSettingsPanel.component.html"),
    controller: AggregateSettingsPanelController
};
