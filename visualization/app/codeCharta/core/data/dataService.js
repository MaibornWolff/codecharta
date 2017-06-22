"use strict";

import * as d3 from "d3";
import {DataModel} from "./model/dataModel";

/**
 * This service stores and sets the current revisions, map, metrics and deltas.
 */
class DataService {

    /* @ngInject */
    constructor($rootScope){

        /**
         * current data
         * @type {DataModel}
         */
        this.data = new DataModel([],[],{},{});

        /**
         * Angular rootScope
         * @type {Scope}
         */
        this.$rootScope = $rootScope;

    }

    /**
     *
     * @param {CodeMap} map has form of schema.json
     * @param {number} revision
     */
    setMap(map, revision) {
        this.data.revisions[revision] = map;
    }

    /**
     * Sets metrics from a revision by id.
     * @param {number} index id
     */
    setMetrics(index) {
        let root = d3.hierarchy(this.data.revisions[index].root);
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
        if(index>0) {
            this.data.firstMap = this.data.revisions[index - 1];
        } else {
            this.data.firstMap = this.data.revisions[index];
        }

        //TODO check it
        this.calculateAndStoreDeltas(this.data.firstMap, this.data.currentmap);

        //TODO for debug
        console.log(this.data.firstMap, this.data.currentmap);

        this.$rootScope.$broadcast("data-changed", this.data);
    }

    //TODO eigener Service für DeltaKalkulation
    /**
     * Calculates delta values in revisions. Stores deltas in <leaf>.data.deltas.
     * @returns {CodeMap[]} revisions with delta data attached in leaves
     */
    calculateAndStoreDeltas(firstRevision, secondRevision) {

        let firstRoot = d3.hierarchy(firstRevision);
        let firstLeaves = firstRoot.leaves();
        let secondRoot = d3.hierarchy(secondRevision);
        let secondLeaves = secondRoot.leaves();

        for(var j=0;j<firstLeaves.length;j++){
            for(var k=0;k<secondLeaves.length;k++){
                if(firstLeaves[j].data.name === secondLeaves[k].data.name){
                    //calculate delta for those nodes attributes and push it to the second leave
                    let deltas = this.calculateAttributeListDelta(secondLeaves[k].data.attributes,firstLeaves[j].data.attributes);
                    firstLeaves[j].data.deltas = deltas;
                }
            }
        }

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
