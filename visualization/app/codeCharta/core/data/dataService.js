"use strict";

import * as d3 from "d3";
import {DataModel} from "./model/dataModel";

/**
 * This service stores and sets the current revisions, map and metrics
 */
export class DataService {

    /* @ngInject */
    constructor($rootScope, deltaCalculatorService){

        /**
         * Current data
         * @type {DataModel}
         */
        this.data = new DataModel([],[],{},{});

        /**
         * @type {Scope}
         */
        this.$rootScope = $rootScope;

        /**
         * @type {DeltaCalculatorService}
         */
        this.deltaCalculator = deltaCalculatorService;

    }

    /**
     * Puts a CodeMap into a given revision slot
     * @param {CodeMap} A well formed code map
     * @param {number} revision the maps position in the revisions array
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
     * Selects and sets the first map to compare.
     * @param {number} index the maps index in the revisions array
     */
    setFirstMapFromRevisions(index){
        //TODO unify metrics from both maps, fill missing attributes with 0 or some other solution TBD
        this.setMetrics(index);
        this.data.firstMap = this.data.revisions[index];
        this.deltaCalculator.decorateRevisionsWithDeltas(this.data.firstMap, this.data.secondMap);
        //TODO the goal is to get rid of this untyped event system, observer ?
        this.$rootScope.$broadcast("data-changed", this.data);
    }

    /**
     * Selects and sets the second map to compare.
     * @param {number} index the maps index in the revisions array
     */
    setSecondMapFromRevisions(index){
        this.setMetrics(index);
        this.data.secondMap = this.data.revisions[index];
        this.deltaCalculator.decorateRevisionsWithDeltas(this.data.firstMap, this.data.secondMap);
        this.$rootScope.$broadcast("data-changed", this.data);
    }

}