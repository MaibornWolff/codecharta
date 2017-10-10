"use strict";
import {DataServiceSubscriber, DataService, DataModel} from "../../core/data/dataService";
import {SettingsService} from "../../core/settings/settingsService";
import {CodeMap} from "../../core/data/model/CodeMap";

/**
 * Controls the RevisionChooser
 */
class RevisionChooserController implements DataServiceSubscriber{

    private revisions: CodeMap[];

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
     * called on data change
     * @param {DataModel} data
     */
    onDataChanged(data: DataModel) {
        this.revisions = data.revisions;
    }

    loadComparisonMap(key) {
        this.dataService.setComparisonMap(key);
    }


    loadReferenceMap(key) {
        this.dataService.setReferenceMap(key);
    }

}

export {RevisionChooserController};


