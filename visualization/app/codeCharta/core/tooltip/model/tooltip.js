/**
 * Represents a tooltip object
 */
export class Tooltip {

    /**
     * @param {String} name
     * @param {String} tooltip
     */
    constructor(name, tooltip) {

        /**
         * identifier of the tooltip
         * @type {String}
         */
        this.name = name;

        /**
         * description of the tooltip
         * @type {String}
         */
        this.tooltip = tooltip;

    }

    /**
     *
     * @returns {String} identifier
     */
    getName() {
        return this.name;
    }

    /**
     *
     * @returns {String} desctiption
     */
    getTooltip() {
        return this.tooltip;
    }

}