"use strict";

/**
 * Renders a simple floating action button.
 */
class FabDirective{

    /**
     * @constructor
     */
    constructor() {
        /** @type {string} */
        this.templateUrl = "./fab.html";

        /** @type {string} */
        this.restrict = "E";

        /**
         * Binds a font awesome icon as 'iconClass'.
         * Binds a click function 'ngClick' as 'clickFunction'.
         * @type {Scope}
         **/
        this.scope = {
            iconClass: "@iconClass",
            clickFunction: "&ngClick"
        };
    }

    /**
     *
     * Binds click function.
     *
     * @param {Scope} scope
     * @param {Object} element
     */
    link (scope, element){
        $(element).on("click", function(e) {
            scope.clickFunction();
        });
    }

}

export {FabDirective};
