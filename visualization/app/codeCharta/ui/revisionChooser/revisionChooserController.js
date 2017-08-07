"use strict";

/**
 * Controls the RevisionChooser
 */
class RevisionChooserController {

    /* @ngInject */

    /**
     * @listens {data-changed}
     * @constructor
     * @param {DataService} dataService
     * @param {Scope} $scope
     */
    constructor(dataService, $scope, settingsService) {

        /**
         *
         * @type {DataService}
         */
        this.dataService = dataService;

        this.settingsService = settingsService;

        /**
         *
         * @type {CodeMap[]}
         */
        this.revisions = dataService.data.revisions;

        let ctx = this;

        $scope.$on("data-changed", (event, data)=>{ctx.onDataChanged(data);});
    }

    /**
     * called on data change
     * @param {DataModel} data
     */
    onDataChanged(data) {
        this.revisions = data.revisions;
        this.single = this.dataService.data.referenceMap.fileName === this.dataService.data.comparisonMap.fileName ? "Single" : "Multiple";
    }


    loadComparisonMap(key) {
        this.dataService.setComparisonMap(key);
    }


    loadReferenceMap(key) {
        this.dataService.setReferenceMap(key);
    }

}

export {RevisionChooserController};


