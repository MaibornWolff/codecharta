"use strict";

class DropdownController{

    /* @ngInject */
    constructor(tooltipService) {
        this.tooltipService = tooltipService;
    }

    getTooltipTextByKey(key) {
        return this.tooltipService.getTooltipTextByKey(key);
    }

}

export {DropdownController};


