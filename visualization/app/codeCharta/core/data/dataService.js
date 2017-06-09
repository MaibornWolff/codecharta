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
        this.data = new DataModel([],[],{});

        /**
         * Angular rootScope
         * @type {Scope}
         */
        this.$rootScope = $rootScope;

    }

    setMap(map) {
        this.data.revisions[0] = map;
        this.setCurrentMapFromRevisions(0);
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

        console.log(this.data.revisions[index], root, leaves, attributeList);

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

}

export {DataService};
