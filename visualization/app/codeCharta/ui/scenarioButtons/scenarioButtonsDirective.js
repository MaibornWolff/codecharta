"use strict";

/**
 * Renders the floating action button bar
 */
class FabBarDirective{

    /**
     * @constructor
     */
    constructor() {

        /**
         *
         * @type {string}
         */
        this.templateUrl = "./fabBar.html";

        /**
         *
         * @type {string}
         */
        this.restrict = "E";

        /**
         *
         * @type {Scope}
         */
        this.scope = {};
    }

}

export {FabBarDirective};
