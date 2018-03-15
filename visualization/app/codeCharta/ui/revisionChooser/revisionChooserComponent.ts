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
        this.ui.chosenComparison = this.getIndexOfMap(this.dataService.getComparisonMap(), this.revisions);
        this.ui.chosenReference = this.getIndexOfMap(this.dataService.getReferenceMap(), this.revisions);
        dataService.subscribe(this);
    }

    onDataChanged(data: DataModel) {
        this.revisions = data.revisions;
        this.ui.chosenComparison = this.getIndexOfMap(this.dataService.getComparisonMap(), this.revisions);
        this.ui.chosenReference = this.getIndexOfMap(this.dataService.getReferenceMap(), this.revisions);
    }

    onReferenceChange(mapIndex: number) {
        this.dataService.setReferenceMap(mapIndex);
    }

    onComparisonChange(mapIndex: number) {
        this.dataService.setComparisonMap(mapIndex);
    }

    private getIndexOfMap(map: CodeMap, mapArray: CodeMap[]) {

        if (mapArray && map) {
            for (let i = 0; i < mapArray.length; i++) {
                if (mapArray[i] && mapArray[i].fileName === map.fileName) {
                    return i;
                }
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




