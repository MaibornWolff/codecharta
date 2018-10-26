import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import "./multipleFilePanel.component.scss";
import {DataModel, DataService, DataServiceSubscriber} from "../../core/data/data.service";
import {CodeMap} from "../../core/data/model/CodeMap";
import {MultipleFileService} from "../../core/multipleFile/multipleFile.service";
import {IRootScopeService} from "angular";

export class MultipleFilePanelController implements DataServiceSubscriber, SettingsServiceSubscriber{

    public settings: Settings;
    public data: DataModel;
    public revisions: CodeMap[];
    public selectedMapIndices : number[];
    public mapsToAggregate : CodeMap[];

    /* @ngInject */
    constructor(
        private $rootScope: IRootScopeService,
        private settingsService: SettingsService,
        private dataService: DataService,
        private multipleFileService: MultipleFileService,
    ) {
        this.revisions = dataService.data.revisions;
        this.settings = settingsService.settings;
        this.data = dataService.data;
        this.dataService.subscribe(this);
        this.settingsService.subscribe(this);
        this.mapsToAggregate = [] as CodeMap[];
        this.updateSelectedMapIndices();
    }

    onMultipleChange(){

        this.selectMapsToAggregate();

        let newMap = this.multipleFileService.aggregateMaps(JSON.parse(JSON.stringify(this.mapsToAggregate)));

        this.settings.map = newMap;
        this.settingsService.applySettings(this.settings);
    }

    onDataChanged(data: DataModel) {
        this.data = data;
        this.revisions = data.revisions;
        this.updateSelectedMapIndices();
    }

    onSettingsChanged(settings: Settings, event: Event) {
        this.settings = settings;
    }

    updateSelectedMapIndices(){
        this.selectedMapIndices = [];
        let indexOfReferenceMap = this.dataService.getIndexOfMap(this.dataService.getReferenceMap(), this.revisions);
        this.selectedMapIndices.push(indexOfReferenceMap);
    }


    private selectMapsToAggregate(){
        this.mapsToAggregate = [] as CodeMap[];

        for(let position of this.selectedMapIndices){
            let currentCodeMap = this.revisions[position];
            this.mapsToAggregate.push(currentCodeMap);
        }
    }
}

export const multipleFilePanelComponent = {
    selector: "multipleFilePanelComponent",
    template: require("./multipleFilePanel.component.html"),
    controller: MultipleFilePanelController
};
