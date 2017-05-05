export class Tooltip {

    /**
     * @param {String} name
     * @param {String} tooltip
     */
    constructor(name, tooltip) {

        /**
         * @type {String}
         */
        this.name = name;

        /**
         * @type {String}
         */
        this.tooltip = tooltip;

    }

    /**
     *
     * @returns {String}
     */
    getName() {
        return this.name;
    }

    /**
     *
     * @returns {String}
     */
    getTooltip() {
        return this.tooltip;
    }

}