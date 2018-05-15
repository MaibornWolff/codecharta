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
        this.chosenMaps = [];

        //this.selectMaps();
    }

    onAggregateChange(){
        //Call backend code here
        this.selectMaps();
        console.log("chosenMaps", this.chosenMaps);
        this.aggregate.aggregateMaps(this.chosenMaps);
        this.settingsService.applySettings();
    }

    onDataChanged(data: DataModel) {
        this.data = data;

        if(!this.currentAggregation){
            this.currentAggregation = [];
            this.currentAggregation.push(this.dataService.getIndexOfMap(
                this.dataService.getReferenceMap(), this.revisions));
        }

        this.onAggregateChange();
    }

    onSettingsChanged(settings: Settings, event: Event) {
        this.settings = settings;
    }


    selectMaps(){
        this.chosenMaps = [];

        for(let position in this.currentAggregation){
            let currentCodeMap = this.revisions[parseInt(position)];
            this.chosenMaps.push(currentCodeMap);
        }
    }

}

export const aggregateSettingsPanelComponent = {
    selector: "aggregateSettingsPanelComponent",
    template: require("./aggregateSettingsPanel.component.html"),
    controller: AggregateSettingsPanelController
};
