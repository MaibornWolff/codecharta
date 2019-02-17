"use strict";

export const TOOLTIPS_CHANGED_EVENT_ID = "tooltips-changed";
export const NO_DESCRIPTION = "no description";

export interface Tooltips {
    [key: string]: string;
}

export interface TooltipServiceSubscriber {
    onTooltipsChanged(tooltips: Tooltips, event: Event);
}

/**
 * Return tooltips containing descriptions
 */
class TooltipService {

    public static SELECTOR = "tooltipService";

    private _tooltips: Tooltips;

    /* @ngInject */
    constructor(private $rootScope) {
        this.tooltips = require("./tooltips.json");
    }

    public subscribe(subscriber: TooltipServiceSubscriber) {
        this.$rootScope.$on(TOOLTIPS_CHANGED_EVENT_ID, (event, data) => {
            subscriber.onTooltipsChanged(data, event);
        });
    }

    get tooltips(): Tooltips {
        return this._tooltips;
    }

    set tooltips(value: Tooltips) {
        this._tooltips = value;
        this.$rootScope.$broadcast(TOOLTIPS_CHANGED_EVENT_ID, this._tooltips);
    }

    /**
     * returns the tooltip description related to the given key
     * @param {String} key
     * @returns {String} the description related to the given key
     */
    public getTooltipTextByKey(key: string) {

        //noinspection TypeScriptUnresolvedFunction
        /**
         * This RegExp describes any set of zero or more
         * non-whitespace symbols between "_"
         * @type {RegExp}
         */
        const patt = new RegExp(/{\S*}/);

        if (this._tooltips[key]) {

            let res = this._tooltips[key];


            /**
             * Any value between "_" Symbols is substituted by its description
             */
            while (patt.test(res)) {
                res = res.replace(/{(.*?)}/, this.replaceString.bind(this));
            }
            return res;

        } else {
            return NO_DESCRIPTION;
        }

    }

    /**
     * Function used for recursiveness with getTooltipTexByKey
     * @param {String} match matched string
     * @param {String} p1 first regex group
     * @returns {String}
     */
    public replaceString(match, p1) {
        return this.getTooltipTextByKey(p1);
    }

}

export {TooltipService};
