"use strict";

import * as d3 from "d3";

class DataLoadingService {

    /* @ngInject */
    constructor($rootScope, dataValidatorService, dataService){

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

        /**
         * Reference to the storage service
         * @type {DataService}
         */
        this.storage = dataService;

    }

    loadMapFromFileContent(fileContent, revision) {

        if (!revision) {
            revision = 0;
        }

        return new Promise((resolve, reject) => {

            this.validator.validate(fileContent).then(

                (validResult)=>{


                    if (fileContent.nodes && fileContent.nodes[0]) {
                        fileContent = fileContent.nodes[0];
                    } else if (fileContent.children) {
                        fileContent = fileContent;
                    } else {
                        window.alert("Incompatible data imported, expected fields were unavailable.");
                        reject();
                    }

                    this.storage.setMap(fileContent, revision);

                    resolve(fileContent, validResult);

                }, (invalidResult) => {
                    reject(fileContent, invalidResult);
                }

            );

        });

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

export {DataLoadingService};
