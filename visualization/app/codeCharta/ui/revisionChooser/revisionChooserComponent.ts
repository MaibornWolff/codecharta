import {DataServiceSubscriber, DataService, DataModel} from "../../core/data/data.service";
import {SettingsService} from "../../core/settings/settings.service";
import {CodeMap} from "../../core/data/model/CodeMap";

/**
 * Controls the RevisionChooser
 */
export class RevisionChooserController implements DataServiceSubscriber{

    public revisions: CodeMap[];
    public ui = {
        chosenReference: null,
        chosenComparison: null,
    };

    /* @ngInject */

    /**
     * @listens {data-changed}
     * @constructor
     * @param {DataService} dataService
     */
    constructor(
        private dataService: DataService,
        private settingsService: SettingsService
    ) {
        this.revisions = dataService.data.revisions;
        this.ui.chosenComparison = this.dataService.getComparisonMap();
        this.ui.chosenReference = this.dataService.getReferenceMap();
        dataService.subscribe(this);
    }

    onDataChanged(data: DataModel) {
        this.revisions = data.revisions;
        this.ui.chosenComparison = this.dataService.getComparisonMap();
        this.ui.chosenReference = this.dataService.getReferenceMap();
    }

    onReferenceChange(map: CodeMap) {
        this.dataService.setReferenceMap(this.getIndexOfMap(map, this.dataService.data.revisions));
    }

    onComparisonChange(map: CodeMap) {
        this.dataService.setComparisonMap(this.getIndexOfMap(map, this.dataService.data.revisions));
    }

    loadComparisonMap(key: number) {
        this.dataService.setComparisonMap(key);
    }


    loadReferenceMap(key: number) {
        this.dataService.setReferenceMap(key);
    }

    private getIndexOfMap(map: CodeMap, mapArray: CodeMap[]) {

        for(let i = 0; i<mapArray.length; i++){
            if(mapArray[i] && map && mapArray[i].fileName === map.fileName){
                return i;
            }
        }

        return -1;

    }


}

export const revisionChooserComponent = {
    selector: "revisionChooserComponent",
    template: require("./revisionChooser.html"),
    controller: RevisionChooserController
};




