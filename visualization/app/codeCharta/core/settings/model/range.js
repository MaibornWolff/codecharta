/**
 * Defines a range with direction. The direction tells the user if the lower end has a positive meaning and the higher
 * end has a negative meaning (true) or vice versa (false). E.g. flipped is true therefore all values below from are
 * green, between from and to yellow and higher than to red.
 */
export class Range {

    /**
     * @constructor
     * @param {number} from starting value
     * @param {number} to ending value
     * @param {boolean} flipped direction (positive to negative (true) or the other way round (false))
     */
    constructor(from, to, flipped) {

        /**
         * starting value
         * @type {number}
         */
        this.from = from;

        /**
         * ending value
         * @type {number}
         */
        this.to = to;

        /**
         * direction (positive to negative (true) or the other way round (false))
         * @type {boolean}
         */
        this.flipped = flipped;

    }

}