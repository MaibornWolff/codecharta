"use strict";

/**
 * Collapsible element. Should be put inside a {@link CollapsibleDirective}.
 */
class CollapsibleElementDirective{

    /**
     * @constructor
     */
    constructor($rootScope, $timeout) {

        /** @type {string} */
        this.restrict = "E";

        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
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
        const ctx = this;
        $("#settingsPanel .collapsible").collapsible({
            accordion: false,
            onOpen: function() { ctx.$timeout(function () {
                //This forces to rerender all rzsliders in this collapsible element. rz sliders do not automatically recognize collapse events from materialize therefore this is nessecary.
                ctx.$rootScope.$broadcast("rzSliderForceRender");
            }); }
        });
    }

}

export {CollapsibleElementDirective};
