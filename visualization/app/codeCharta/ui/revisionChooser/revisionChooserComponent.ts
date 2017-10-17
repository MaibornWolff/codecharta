import {DataServiceSubscriber, DataService, DataModel} from "../../core/data/dataService";
import {SettingsService} from "../../core/settings/settingsService";
import {CodeMap} from "../../core/data/model/CodeMap";

import $ from "jquery";

/**
 * Controls the RevisionChooser
 */
export class RevisionChooserController implements DataServiceSubscriber{

    private revisions: CodeMap[];
    public visible: boolean = false;

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
        console.log("toggle");
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




