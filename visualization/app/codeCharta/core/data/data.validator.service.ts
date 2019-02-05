"use strict";
import {CodeMapNode} from "./model/CodeMap";

/**
 * This service validates the given data against the schema and other validation steps
 */
export class DataValidatorService {

    /**
     * Checks if a nodes children are unique in name+type
     * @param {Object} node
     * @returns {boolean} true if the node has unique children
     */
    public hasUniqueChildren(node: CodeMapNode) {

        if(!node.children || node.children.length == 0) { return true; }

        let names = {};
        for(let child of node.children) {
            names[child.name + child.type] = true;
        }
        if(Object.keys(names).length !== node.children.length) { return false; }

        for(let child of node.children){
            if(!this.hasUniqueChildren(child)) { return false; }
        }
        return true;
    }

    /**
     * validates the given file data against the schema file and checks for unique names in a parents direct children.
     * @param {Object} well formed fileContent (schema.json)
     * @returns {Promise} which resolves when the filecontent is valid, rejects with errors otherwise
     */
    public validate(data): Promise<void> {

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