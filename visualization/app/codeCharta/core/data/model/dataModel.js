/**
 * Defines the current DataModel of the core/data package.
 */
export class DataModel {

    /**
     * @param {CodeMap[]} revisions current revisions
     * @param {string[]} metrics current metrics
     * @param {CodeMap} comparisonMap current first map
     * @param {CodeMap} referenceMap current second map
     */
    constructor(revisions, metrics, comparisonMap, referenceMap) {

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
        this.referenceMap = referenceMap;

        /**
         * map to which the delta is calculated
         * @type {CodeMap}
         */
        this.comparisonMap = comparisonMap;

        //TODO Indizes statt ganze Maps in currentmap und comparisonMap

    }

}