"use strict";

import * as Ajv from "ajv";
import * as d3 from "d3";
/**
 * This service validates the given data against the schema and other validation steps
 */
class DataValidatorService {

    /* @ngInject */

    /**
     * @constructor
     * @external {$http} https://docs.angularjs.org/api/ng/service/$http
     */
    constructor($http){
        /**
         * stores the $http instance
         * @type {$http}
         */
        this.http = $http;
    }

    /**
     * checks the array for unique names in its elements. The name must be stored in <element>.data.name
     *
     * @example
     * [{data:{name:"aName"}, {data:{name:"aName"}}] //returns false
     *
     * @example
     * [{data:{name:"aName"}, {data:{name:"bName"}}] //returns true
     * 
     * @param {Object[]} arr array of well formed objects
     *
     * @returns {boolean} true if there are only unique names in the given array
     */
    uniqueArray(arr){
        var alreadyUsedName= [];
        for(var i=0;i<arr.length;i++){//Every item in the array iterated
            alreadyUsedName=[];
            for( var j=0;j<i;j++){//Every item previous to i th iterated
                if((arr[j].data.name> arr[i].data.name)? false : ((arr[j].data.name< arr[i].data.name)? false:true)){
                    return false;
                }
                else{
                    alreadyUsedName.push(arr[i].data.name);
                }
            }
        }
        return true;
    }

    /**
     * converts the data into a {d3#hierarchy} and checks if the children of the same parent have unique names in <child>.data.name
     * 
     * @param {Object} data data from loaded file
     * @returns {boolean} true if there are only unique names in a parents direct children
     */
    uniqueName(data) {

        var levelOfTree = [];
        var horizontalPosition= [];
        horizontalPosition[0]=0;
        var j=1;

        if(data.revisions) {
            data.children = data.revisions;
        }

        /**
         * @external {d3#hierarchy} https://github.com/d3/d3-hierarchy/blob/master/README.md#hierarchy
         */
        let root = d3.hierarchy(data);

        if(root.children){
            levelOfTree=root.children;
            horizontalPosition[j]=0;
            while(horizontalPosition[j]<levelOfTree.length||
            (levelOfTree.parent&&levelOfTree[0].parent.parent.children)){
                for(var i=0;i<levelOfTree.length;i++){
                }
                if( horizontalPosition[j]===0&&!(data.revisions && j===1)&&!(this.uniqueArray(levelOfTree))){
                    return false;
                }
                if(levelOfTree[horizontalPosition[j]].children){
                    levelOfTree=levelOfTree[horizontalPosition[j]].children;
                    j++;
                    horizontalPosition[j]=0;
                }
                else{
                    levelOfTree = levelOfTree[0].parent.parent.children;
                    j--;
                    horizontalPosition[j]++;
                    while(horizontalPosition[j]>=levelOfTree.length&&
                    (levelOfTree.parent&&levelOfTree[0].parent.parent.children)){
                        levelOfTree = levelOfTree[0].parent.parent.children;
                        j--;
                        horizontalPosition[j]++;
                    }
                }
            }
        }
        return true;
    }

    /**
     * validates the given file data against the schema file and checks for unique names in a parents direct children.
     * 
     * @param {Object} data data from loaded file
     * @returns {Promise} with a resolve and reject function
     */
    validate(data) {

        var ctx = this;

        return new Promise((resolve, reject) => {

            this.http.get("schema.json").then(
                (response) => {

                    if(response.status === 200) {
                        var ajv = Ajv.default();
                        var compare = ajv.compile(response.data);
                        var valid = compare(data);
                        valid &= ctx.uniqueName(data);

                        if (valid) {
                            resolve({valid: true, errors: []});
                        } else {
                            reject({valid: false, errors: compare.errors});
                        }
                    } else {
                        reject({valid: false, errors: [{
                            "message":response.status,
                            "dataPath": "http"
                        }]});
                    }

                }, (e)=>{
                    reject({valid: false, errors: [{
                        "message":e,
                        "dataPath": "angular http"
                    }]});
                }
            );

        });

    }

}

export {DataValidatorService};
