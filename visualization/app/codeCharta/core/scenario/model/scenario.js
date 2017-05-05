/**
 * This class defines a codecharta scenario. It may store data like settings and gui configurations
 */
export class Scenario {

    /**
     * @constructor
     * @param {String} name
     * @param {Settings} settings
     */
    constructor(name, settings) {

        /**
         * name of this scenario
         * @type {String}
         */
        this.name = name;

        /**
         * settings for this scenario
         * @type {Settings}
         */
        this.settings = settings;

    }

}
