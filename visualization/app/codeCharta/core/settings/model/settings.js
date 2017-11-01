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
     * @param {Number} amountOfTopLabels
     * @param {Scale} scaling
     * @param {Scale} camera
     * @param {Number} margin
     */
    constructor(map, neutralColorRange, areaMetric, heightMetric, colorMetric, deltas, amountOfTopLabels, scaling, camera, margin) {

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
         * number of highest buildings with labels
         * @type {Number}
         */
        this.amountOfTopLabels = amountOfTopLabels;

        /**
         * scaling settings
         * @type {Scale}
         */
        this.scaling = scaling;

        /**
         * camera position
         * @type {Scale}
         */
        this.camera = camera;

        /**
         * margin between buildings
         * @type {number}
         */
        this.margin = margin;

    }

    /**
     * Imports the given settings values without replacing this object with the given one.
     * @param {Settings} settings given settings
     */
    importSettingValues(settings){
        this.map = settings.map;
        this.neutralColorRange = settings.neutralColorRange;
        this.areaMetric = settings.areaMetric;
        this.heightMetric = settings.heightMetric;
        this.colorMetric = settings.colorMetric;
        this.deltas = settings.deltas;
        this.amountOfTopLabels = settings.amountOfTopLabels;
        this.scaling = settings.scaling;
        this.camera = settings.camera;
        this.margin = settings.margin;
    }

}
