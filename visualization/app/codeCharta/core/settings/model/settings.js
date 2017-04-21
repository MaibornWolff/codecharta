/**
 * This class defines the available set of settings in the CodeCharta application
 */
export class Settings {

    /**
     * @constructor
     * @param {CodeMap} map
     * @param {Range} neutralColorRange
     * @param {string} areaMetric
     * @param {string} heightMetric
     * @param {string} colorMetric
     * @param {boolean} deltas
     * @param {boolean} grid
     */
    constructor(map, neutralColorRange, areaMetric, heightMetric, colorMetric, deltas, grid) {

        /**
         * currently selected map
         * @type {CodeMap}
         */
        this.map = map;

        /**
         * currently set neutral color range. This defines the yellow color range and the whether higher or lower values are green or red.
         * @type {Range}
         */
        this.neutralColorRange = neutralColorRange;

        /**
         * currently selected area metric
         * @type {string}
         */
        this.areaMetric = areaMetric;

        /**
         * currently selected heightm metric
         * @type {string}
         */
        this.heightMetric = heightMetric;

        /**
         * currently selected color metric
         * @type {string}
         */
        this.colorMetric = colorMetric;

        /**
         * delta flag
         * @type {boolean}
         */
        this.deltas = deltas;

        /**
         * grid flag
         * @type {boolean}
         */
        this.grid = grid;

    }
    importSettingValues(settings){
        this.map = settings.map;
        this.neutralColorRange = settings.neutralColorRange;
        this.areaMetric = settings.areaMetric;
        this.heightMetric = settings.heightMetric;
        this.colorMetric = settings.colorMetric;
        this.deltas = settings.deltas;
        this.grid = settings.grid;
    }

}
