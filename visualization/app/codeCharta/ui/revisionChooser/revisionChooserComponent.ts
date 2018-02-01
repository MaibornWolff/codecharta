import {DataServiceSubscriber, DataService, DataModel} from "../../core/data/data.service";
import {SettingsService} from "../../core/settings/settings.service";
import {CodeMap} from "../../core/data/model/CodeMap";

import $ from "jquery";

/**
 * Controls the RevisionChooser
 */
export class RevisionChooserController implements DataServiceSubscriber{

    public revisions: CodeMap[];
    public visible: boolean = false;
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
        this.ui.chosenComparison = this.dataService.getLastComparisonMap();
        this.ui.chosenReference = this.dataService.getLastReferenceMap();
        dataService.subscribe(this);
    }

    /**
     * Links the click Handler
     * @param {Scope} scope
     * @param {object} element dom element
     */
    $postLink() {
        $("#revisionButton").bind("click", this.toggle.bind(this));
        $("#mapButton").bind("click", this.toggle.bind(this));
    }

    /**
     * Toggles the visibility
     */
    toggle(){
        if (this.visible) {
            //noinspection TypeScriptUnresolvedFunction
            $("#revisionChooser").animate({left: -500 + "px"});
            this.visible = false;
        } else {
            //noinspection TypeScriptUnresolvedFunction
            $("#revisionChooser").animate({left: 2.8+"em"});
            this.visible = true;
        }
    }

    /**
     * called on data change
     * @param {DataModel} data
     */
    onDataChanged(data: DataModel) {
        this.revisions = data.revisions;
        this.ui.chosenComparison = this.dataService.getLastComparisonMap();
        this.ui.chosenReference = this.dataService.getLastReferenceMap();
    }

    onReferenceChange(map: CodeMap) {
        this.dataService.setReferenceMap(this.dataService.getIndexOfMap(map));
    }

    onComparisonChange(map: CodeMap) {
        this.dataService.setComparisonMap(this.dataService.getIndexOfMap(map));
    }

    loadComparisonMap(key: number) {
        this.dataService.setComparisonMap(key);
    }


    loadReferenceMap(key: number) {
        this.dataService.setReferenceMap(key);
    }

}

export const revisionChooserComponent = {
    selector: "revisionChooserComponent",
    template: require("./revisionChooser.html"),
    controller: RevisionChooserController
};




