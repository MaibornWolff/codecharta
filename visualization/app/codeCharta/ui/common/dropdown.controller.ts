"use strict";
import {TooltipService, TooltipServiceSubscriber, Tooltips} from "../../core/tooltip/tooltip.service.ts";
import {IScope} from "angular";
/**
 * Controller for the DropdownDirective
 */
class DropdownController implements TooltipServiceSubscriber{

    /* @ngInject */
    /**
     *
     * @param {TooltipService} tooltipService
     * @param {Scope} $scope
     */
    constructor(
        private tooltipService: TooltipService,
        private $scope: IScope) {

        tooltipService.subscribe(this);

    }

    onTooltipsChanged(tooltips: Tooltips, event: Event) {
        this.$scope.$apply();
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


