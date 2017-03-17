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
        this.revisions = dataService.revisions;

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

    /**
     * loads a specific revision by id
     * @param {number} key id
     */
    loadRevision(key) {
        this.dataService.setCurrentMapFromRevisions(key);
    }

}

export {RevisionChooserController};


