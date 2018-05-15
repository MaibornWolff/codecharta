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
    };e

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
        this.ui.chosenComparison = this.dataService.getIndexOfMap(this.dataService.getComparisonMap(), this.revisions);
        this.ui.chosenReference = this.dataService.getIndexOfMap(this.dataService.getReferenceMap(), this.revisions);
        console.log("revision", this.ui.chosenComparison);
        dataService.subscribe(this);
    }

    onDataChanged(data: DataModel) {
        this.revisions = data.revisions;
        this.ui.chosenComparison= this.dataService.getIndexOfMap(this.dataService.getComparisonMap(), this.revisions);
        this.ui.chosenReference = this.dataService.getIndexOfMap(this.dataService.getReferenceMap(), this.revisions);
    }

    onReferenceChange(mapIndex: number) {
        this.dataService.setReferenceMap(mapIndex);
    }

    onComparisonChange(mapIndex: number) {
        this.dataService.setComparisonMap(mapIndex);
    }


}

export const revisionChooserComponent = {
    selector: "revisionChooserComponent",
    template: require("./revisionChooser.html"),
    controller: RevisionChooserController
};




