"use strict";
import {CodeMapNode} from "./model/CodeMap";

/**
 * This service validates the given data against the schema and other validation steps
 */
export class DataValidatorService {

    /* @ngInject */

    /**
     * @constructor
     */
    constructor() {

    }

    /**
     * Checks if a nodes children are unique in name
     * @param {Object} node
     * @returns {boolean} true if the node has unique children
     */
    hasUniqueChildren(node: CodeMapNode) {

        if(node.children && node.children.length > 0) {

            let names = {};

            for(let i=0; i<node.children.length; i++){
                names[node.children[i].name] = true;
            }

            if(Object.keys(names).length !== node.children.length){
                return false;
            } else {
                let valid = true;
                for(let j=0; j<node.children.length; j++){
                    valid = valid && this.hasUniqueChildren(node.children[j]);
                }
                return valid;
            }


        } else {
            return true;
        }

    }

    /**
     * validates the given file data against the schema file and checks for unique names in a parents direct children.
     * @param {Object} well formed fileContent (schema.json)
     * @returns {Promise} which resolves when the filecontent is valid, rejects with errors otherwise
     */
    validate(data): Promise<void> {

        return new Promise((resolve, reject) => {

                let ajv = require("ajv")();
                let compare = ajv.compile(require("./schema.json"));
                let valid = compare(data);

                // TODO data.nodes[0] must be the root
                if(!this.hasUniqueChildren(data.nodes[0])){
                    reject([{
                        "message":"names or ids are not unique",
                        "dataPath": "uniqueness"
                    }]);
                }

                if (valid) {
                    resolve();
                } else {
                    reject(compare.errors);
                }


        });

    }

}