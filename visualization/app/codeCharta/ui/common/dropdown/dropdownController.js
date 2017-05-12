"use strict";
/**
 * Controller for the DropdownDirective
 */
class DropdownController{

    /* @ngInject */
    /**
     *
     * @param {TooltipService} tooltipService
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
     * @returns {string} description
     */
    getTooltipTextByKey(key) {
        return this.tooltipService.getTooltipTextByKey(key);
    }

}

export {DropdownController};


