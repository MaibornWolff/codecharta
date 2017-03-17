"use strict";

import * as d3 from "d3";
import {DataModel} from "./model/dataModel";

/**
 * This service loads, stores and sets the current revisions, map, metrics and deltas.
 */
class DataService {

    /* @ngInject */

    /**
     * @constructor
     * @external {Scope} https://docs.angularjs.org/api/ng/type/$rootScope.Scope
     * @param {Scope} $rootScope angular rootScope
     * @param {DataValidatorService} dataValidatorService
     */
    constructor($rootScope, dataValidatorService){

        /**
         * current data
         * @type {DataModel}
         */
        this.data = new DataModel([],[],{});

        /**
         * Angular rootScope
         * @type {Scope}
         */
        this.$rootScope = $rootScope;

        /**
         * Reference to a dataValidatorService
         * @type {DataValidatorService}
         */
        this.validator = dataValidatorService;

    }
    
    /**
     * Called when a new file is loaded. This method validates the data with {@link DataValidatorService#validate}, processes it and sets the member fields.
     * Selects the first revision in revisions as the currently selected map. Alerts the user if something goes wrong.
     * @param {Object} fileData data from file
     * @returns {Promise} promise with resolve and reject functions
     */
    setFileData(fileData) {

        return new Promise((resolve, reject) => {

            this.validator.validate(fileData).then(

                (validResult)=>{

                    if (fileData.revisions) {
                        //revisioned data
                        this.data.revisions = this.calculateDeltas(fileData.revisions);
                    } else {
                        //unrevisioned data
                        if (fileData.nodes && fileData.nodes[0]) {
                            fileData = fileData.nodes[0];
                        } else if (fileData.children) {
                            fileData = fileData;
                        } else {
                            window.alert("Incompatible data imported, expected fields were unavailable.");
                            reject();
                        }

                        this.data.revisions = [
                            fileData
                        ];
                    }

                    resolve(fileData, validResult);

                    this.setCurrentMapFromRevisions(0);

                }, (invalidResult) => {
                    reject(fileData, invalidResult);
                }

            );

        });

    }

    /**
     * Sets metrics from a revision by id.
     * @param {number} index id
     */
    setMetrics(index) {
        let root = d3.hierarchy(this.data.revisions[index]);
        let leaves = root.leaves();
        let attributeList = leaves.map(function(d) { return d.data.attributes ? Object.keys(d.data.attributes) : []; });
        let attributes = attributeList.reduce(function(left, right) {return left.concat(right.filter(function(el){return left.indexOf(el) === -1;})); });

        this.data.metrics = attributes;

    }

    /**
     * Loads current map from revisions by id
     * @param {number} index id
     * @emits {data-changed} on $rootScope after setting the metrics and map.
     */
    setCurrentMapFromRevisions(index){
        this.setMetrics(index);
        this.data.currentmap = this.data.revisions[index];
        this.$rootScope.$broadcast("data-changed", this.data);
    }

    /**
     * Calculates delta values in revisions. Stores deltas in <leaf>.data.deltas.
     * @param {CodeMap[]} revisions
     * @returns {CodeMap[]} revisions with delta data attached in leaves
     */
    calculateDeltas(revisions) {

        let lastRevision = revisions[0];

        for(var i=1;i<revisions.length;i++){
            let currentRevision = revisions[i];
            let currentRoot = d3.hierarchy(currentRevision);
            let currentLeaves = currentRoot.leaves();
            let lastRoot = d3.hierarchy(lastRevision);
            let lastLeaves = lastRoot.leaves();

            for(var j=0;j<currentLeaves.length;j++){
                for(var k=0;k<lastLeaves.length;k++){
                    if(currentLeaves[j].data.name === lastLeaves[k].data.name){
                        //calculate delta for those nodes attributes and push it to the second leave
                        let deltas = this.calculateAttributeListDelta(lastLeaves[k].data.attributes,currentLeaves[j].data.attributes);
                        currentLeaves[j].data.deltas = deltas;
                    }
                }
            }

            lastRevision = currentRevision;

        }

        return revisions;

    }

    /**
     * Calculates deltas between two attribute lists
     * @param {Object[]} first attributes list
     * @param {Object[]} second attributes list
     * @returns {Object[]} delta between first and second
     */
    calculateAttributeListDelta(first, second){
        let deltas = {};
        for (var key in second) {
            if(key) {
                let firstValue = first[key] ? first[key] : 0; //assume zero if no value in first
                let secondValue = second[key];
                let delta = secondValue - firstValue;
                deltas[key] = delta;
            }
        }
        return deltas;
    }
    
}

export {DataService};
