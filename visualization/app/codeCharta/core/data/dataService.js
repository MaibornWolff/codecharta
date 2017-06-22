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

    setFirstMapFromRevisions(index){

        //TODO unify metrics from both maps
        this.setMetrics(index);
        this.data.firstMap = this.data.revisions[index];
        this.calculateAndStoreDeltas(this.data.firstMap, this.data.secondMap);

        console.log("setting data", this.data);
        this.$rootScope.$broadcast("data-changed", this.data);

    }

    setSecondMapFromRevisions(index){
        this.setMetrics(index);
        this.data.secondMap = this.data.revisions[index];
        this.calculateAndStoreDeltas(this.data.firstMap, this.data.secondMap);
        console.log("setting data", this.data);
        this.$rootScope.$broadcast("data-changed", this.data);

    }

    //TODO speichere delta 2 minus 1 in 2 und 1 minus 2 in 1
    calculateAndStoreDeltas(firstRevision, secondRevision) {

        if(firstRevision.root && secondRevision.root) {
            let firstRoot = d3.hierarchy(firstRevision.root);
            let firstLeaves = firstRoot.leaves();
            let secondRoot = d3.hierarchy(secondRevision.root);
            let secondLeaves = secondRoot.leaves();

            for (var j = 0; j < firstLeaves.length; j++) {
                for (var k = 0; k < secondLeaves.length; k++) {
                    if (firstLeaves[j].data.name === secondLeaves[k].data.name) {
                        //calculate delta for those nodes attributes and push it to the second leave
                        let firstDeltas = this.calculateAttributeListDelta(secondLeaves[k].data.attributes, firstLeaves[j].data.attributes);
                        let secondDeltas = this.calculateAttributeListDelta(firstLeaves[j].data.attributes, secondLeaves[k].data.attributes);

                        firstLeaves[j].data.deltas = firstDeltas;
                        secondLeaves[k].data.deltas = secondDeltas;

                    }
                }
            }

        } else {
            console.log("cant calculate deltas with 1 or less root");
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
