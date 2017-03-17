export class DataModel {

    /**
     * @typedef {object} CodeMap A Code map is a d3 hierarchy correctly transformed to the needs of this application
     * TODO make a class
     */

    /**
     *
     * @param {CodeMap[]} revisions currently loaded revisions
     * @param {string[]} metrics currently loaded metrics
     * @param {CodeMap} currentmap currently selected map/revision
     */
    constructor(revisions, metrics, currentmap) {

        /**
         * currently loaded revisions
         * @type {CodeMap[]}
         */
        this.revisions = revisions;

        /**
         * currently loaded metrics
         *
         * @type {string[]}
         * @example
         * ["a metric", "another metric"]
         */
        this.metrics = metrics;

        /**
         * currently selected map/revision
         * @type {CodeMap}
         */
        this.currentmap = currentmap;

    }

}