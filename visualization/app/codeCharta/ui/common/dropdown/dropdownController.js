"use strict";
/**
 * Controller for the DropdownDirective
 */
class DropdownController{

    /* @ngInject */
    /**
     *
     * @param {TooltipService} tooltipService
     * @param {Scope} $rootScope
     * @param {Scope} $scope
     */
    constructor(tooltipService, $rootScope, $scope) {
        this.tooltipService = tooltipService;

        $rootScope.$on("tooltips-changed", (event,data) => {
            $scope.$apply();
        });

    }

    /**
     * returns the tooltip description related to the given key
     * @param {String} key
     * @returns {String} description
     */
    getTooltipTextByKey(key) {
        return this.tooltipService.getTooltipTextByKey(key);
    }

}

export {DropdownController};


