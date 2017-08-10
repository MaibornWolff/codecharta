"use strict";

export class LoadingPanelController {

    /* @ngInject */

    /**
     * @listens {data-changed}
     * @constructor
     * @param {Scope} $scope
     */
    constructor($scope) {

        this.tasks = 0;

        let ctx = this;

        $scope.$on("task-started", ()=>{ctx.tasks++;});
        $scope.$on("task-finished", ()=>{ctx.tasks--;});
    }

}

