"use strict";

import * as d3 from "d3";
import {DataModel} from "./model/dataModel";

/**
 * This service stores and sets the current revisions, map and metrics
 */
export class DataService {

    /* @ngInject */
    constructor($rootScope, deltaCalculatorService, dataDecoratorService){

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

        /**
         * @type {DataDecoratorService}
         */
        this.dataDecorator = dataDecoratorService;

    }

    /**
     * Puts a CodeMap into a given revision slot
     * @param {CodeMap} map A well formed code map
     * @param {number} revision the maps position in the revisions array
     */
    setMap(map, revision) {
        this.data.revisions[revision] = map;
        this.setComparisonMap(revision);
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
        for(let value in leaves) {
            if (leaves[value]) {
                //console.log("leaves1 "+leaves[value]);
                for (let value2 in leaves[value]) {
                    if (leaves[value][value2]) {
                        //console.log(" leaves2 " + leaves[value][value2]);

                    }
                }
            }
        }
    }


    /////IM WERDEN////////////////////
    /**
     * Sets metrics from the statistic of two revisions
     */
    //setStatistics()

    //ein funktion für jedes Statistik??
    /////IM WERDEN////////////////////

    /**
     * resets all maps (deletes them)
     */
    resetMaps() {
        this.data.revisions = [];
        this.data.metrics = [];
        this.data.comparisonMap = {};
        this.data.referenceMap = {};
        this.$rootScope.$broadcast("data-changed", this.data);
    }

    /**
     * Selects and sets the first map to compare.
     * @param {number} index the maps index in the revisions array
     */
    setComparisonMap(index){
        this.setMetrics(index);
        this.data.comparisonMap = this.data.revisions[index];
        this.dataDecorator.decorateMapWithUnaryMetric(this.data.comparisonMap);
        this.dataDecorator.decorateMapWithUnaryMetric(this.data.referenceMap);
        this.deltaCalculator.decorateMapsWithDeltas(this.data.comparisonMap, this.data.referenceMap);
        //TODO the goal is to get rid of this untyped event system, observer ?
        this.$rootScope.$broadcast("data-changed", this.data);
    }

    /**
     * Selects and sets the second map to compare.
     * @param {number} index the maps index in the revisions array
     */
    setReferenceMap(index){
        this.setMetrics(index);
        this.data.referenceMap = this.data.revisions[index];
        this.dataDecorator.decorateMapWithUnaryMetric(this.data.comparisonMap);
        this.dataDecorator.decorateMapWithUnaryMetric(this.data.referenceMap);
        this.deltaCalculator.decorateMapsWithDeltas(this.data.comparisonMap, this.data.referenceMap);
        this.$rootScope.$broadcast("data-changed", this.data);
    }

}