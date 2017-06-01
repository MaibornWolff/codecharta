"use strict";

/**
 * Return tooltips containing descriptions
 */
class TooltipService {

    /* @ngInject */

    /**
     * @constructor
     * @param {UrlService} urlService
     * @param {Scope} $rootScope
     */
    constructor($rootScope, urlService){

        /**
         *
         * @type {}
         */
        this.tooltips = [];

        var ctx = this;

        urlService.getFileDataFromFile("tooltips.json").then(

            //resolve
            (data) => {
                ctx.tooltips = data;
                $rootScope.$broadcast("tooltips-changed", this.tooltips);
            },
            //reject
            () => {
                window.alert("error loading tooltips.json");
            }

        );

    }

    /**
     * returns the tooltip description related to the given key
     * @param {String} key
     * @returns {string} the description related to the given key
     */
    getTooltipTextByKey(key) {

        /**
         * This RegExp describes any set of zero or more
         * non-whitespace symbols between "_"
         * @type {RegExp}
         */
        const patt = new RegExp(/_\S*_/);

        if( this.tooltips[key] ){

            var res = this.tooltips[key];


            /**
             * Any value between "_" Symbols is substituted by its description
             */
            while ( patt.test(res) ) {
                res = res.replace(/_(.*?)_/, this.replaceString.bind(this));
            }
            return res;

        } else {
            return "no description";
        }

    }

    /**
     * Function used for recursiveness with getTooltipTexByKey
     * @param a
     * @param {String} b given key
     * @returns {string}
     */
    replaceString(a, b) {
        return this.getTooltipTextByKey(b);
    }
    
}

export {TooltipService};
