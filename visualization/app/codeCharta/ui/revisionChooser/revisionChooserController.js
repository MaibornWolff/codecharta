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
    constructor(dataService, $scope) {

        /**
         *
         * @type {DataService}
         */
        this.dataService = dataService;

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
    }

    loadFirstRevision(key) {
        this.dataService.setFirstMapFromRevisions(key);
    }

    loadSecondRevision(key) {
        this.dataService.setSecondMapFromRevisions(key);
    }

}

export {RevisionChooserController};


