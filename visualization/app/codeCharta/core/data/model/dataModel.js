export class DataModel {

    constructor(revisions, metrics, firstMap, secondMap) {

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
        this.secondMap = secondMap;

        /**
         * map to which the delta is calculated
         * @type {CodeMap}
         */
        this.firstMap = firstMap;


        //TODO Indizes statt ganze Maps in currentmap und firstMap

    }

}