"use strict";

/**
 * This service allows other parts of the application to hook into the update cycle and get called on each cycle.
 */
class ThreeUpdateCycleService {

    /**
     * @constructor
     */
    constructor() {

        /**
         * @callback UpdateCycleCallback
         */

        /**
         * @type {UpdateCycleCallback[]}
         */
        this.updatables = [];
    }

    /**
     * Updates all registered callback functions
     */
    update() {
        this.updatables.forEach((u)=>{
            u();
        });
    }

}

export {ThreeUpdateCycleService};



