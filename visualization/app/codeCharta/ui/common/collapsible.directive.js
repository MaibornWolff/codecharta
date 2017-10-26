"use strict";
/**
 * Container for {CollapsibleElementDirective}. Inner elements do not replace this. They are put inside the ng-transclude tag.
 */
class CollapsibleDirective{

    /**
     * @constructor
     */
    constructor() {
        /** @type {string} */
        this.restrict = "E";
        /** @type {Scope} */
        this.scope = {};
        /** @type {boolean} */
        this.replace = true;
        /** @type {boolean} */
        this.transclude = true;
        /** @type {string} */
        this.template = "<ul class='collapsible' data-collapsible='accordion' ng-transclude></ul>";
    }

}

export {CollapsibleDirective};
