export class CodeMap {

    /**
     * Builds a new CodeMap from the given three parameters.
     * If only one of three parameters is given, then this constructor acts as a data structure assign constructor.
     * @param {String|Object} name or assignable object
     * @param {String} timestamp timestamp of this map
     * @param {Object} root node structure of this map
     */
    constructor(name, timestamp, root) {

        if(arguments.length === 1) {
            Object.assign(this,name);
        } else {
            this.name = name;
            this.timestamp = timestamp;
            this.root = root;
        }

    }


}