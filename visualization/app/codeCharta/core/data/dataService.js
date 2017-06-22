"use strict";

import * as d3 from "d3";
import {DataModel} from "./model/dataModel";

/**
 * This service stores and sets the current revisions, map, metrics and deltas.
 */
class DataService {

    /* @ngInject */
    constructor($rootScope, deltaCalculatorService){

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

        this.deltaCalculator = deltaCalculatorService;

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
        this.deltaCalculator.decorateRevisionsWithDeltas(this.data.firstMap, this.data.secondMap);

        this.$rootScope.$broadcast("data-changed", this.data);

    }

    setSecondMapFromRevisions(index){
        this.setMetrics(index);
        this.data.secondMap = this.data.revisions[index];
        this.deltaCalculator.decorateRevisionsWithDeltas(this.data.firstMap, this.data.secondMap);
        this.$rootScope.$broadcast("data-changed", this.data);

    }

}

export {DataService};
