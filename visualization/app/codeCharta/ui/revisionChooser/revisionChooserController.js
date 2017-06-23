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

    /**
     * loads a specific revision as first map by id
     * @param {number} key id
     */
    loadFirstRevision(key) {
        this.dataService.setFirstMapFromRevisions(key);
    }

    /**
     * loads a specific revision as second map by id
     * @param {number} key id
     */
    loadSecondRevision(key) {
        this.dataService.setSecondMapFromRevisions(key);
    }

}

export {RevisionChooserController};


