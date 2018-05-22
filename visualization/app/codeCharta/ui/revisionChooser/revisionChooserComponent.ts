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
    public show: string;

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
        this.show = "simple";
        this.ui.chosenComparison = this.dataService.getIndexOfMap(this.dataService.getComparisonMap(), this.revisions);
        this.ui.chosenReference = this.dataService.getIndexOfMap(this.dataService.getReferenceMap(), this.revisions);
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

    onShowChange(option){
        switch (option){
            case "simple":{
                this.settingsService.settings.deltas = false;
                this.onReferenceChange(this.ui.chosenReference);
                break;
            }

            case "aggregate":{
                this.settingsService.settings.deltas = false;
                this.settingsService.applySettings();
                break;
            }

            case "deltas":{
                this.settingsService.settings.deltas = true;
                this.settingsService.applySettings();
                break;
            }

            default:{
                console.log("Unexpected value for showing option: "+option);
            }
        }
     }
}

export const revisionChooserComponent = {
    selector: "revisionChooserComponent",
    template: require("./revisionChooser.html"),
    controller: RevisionChooserController
};




