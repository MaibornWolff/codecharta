"use strict";

/**
 * Collapsible element. Should be put inside a {@link CollapsibleDirective}.
 */
class CollapsibleElementDirective{

    /**
     * @constructor
     */
    constructor() {

        /** @type {string} */
        this.restrict = "E";

        /**
         * Binds 'iconClass' string with @. It defines the collapsibles font awesome icon.
         * Binds 'label' string with @ (one time only).
         *
         * @type {Scope} */
        this.scope = {
            iconClass: "@iconClass",
            label:"@"
        };

        /** @type {boolean} */
        this.replace = true;

        /** @type {boolean} */
        this.transclude = true;

        /** @type {string} */
        this.templateUrl = "./collapsibleElement.html";
    }

    /**
     * calls the materialize function collapsible(...) on the collapsible element. This is needed to initialize the functionality.
     */
    link() {
        //needs to be done
        $("#settingsPanel .collapsible").collapsible({
            accordion: false
        });
    }

}

export {CollapsibleElementDirective};
