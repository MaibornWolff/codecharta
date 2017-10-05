"use strict";

import * as d3 from "d3";
import {CodeMap} from "./model/CodeMap";

export interface DataModel {

    revisions: CodeMap[],
    metrics: string[],
    referenceMap: CodeMap,
    comparisonMap: CodeMap

}

export interface DataServiceSubscriber {
    onDataChanged(data: DataModel, event: Event)
}

/**
 * This service stores and sets the current revisions, map and metrics
 */
export class DataService {

    private _data: DataModel;

    /* @ngInject */
    constructor(private $rootScope, private deltaCalculatorService, private dataDecoratorService){

        this._data = {
            revisions: [],
            metrics: [],
            referenceMap: null,
            comparisonMap: null
        };

    }

    get data(): DataModel {
        return this._data;
    }

    public subscribe(subscriber: DataServiceSubscriber) {
        this.$rootScope.$on("data-changed", (event, data) => {
            subscriber.onDataChanged(data, event);
        });
    }

    private notify() {
        this.$rootScope.$broadcast("data-changed", this._data);
    }

    /**
     * Puts a CodeMap into a given revision slot
     * @param {CodeMap} map A well formed code map
     * @param {number} revision the maps position in the revisions array
     */
    public setMap(map: CodeMap, revision: number) {
        this._data.revisions[revision] = map;
        this.setComparisonMap(revision);
    }

    /**
     * Sets metrics from a revision by id.
     * @param {number} index id
     */
    public setMetrics(index: number) {
        let root = d3.hierarchy(this._data.revisions[index].root);
        let leaves = root.leaves();
        let attributeList = leaves.map(function(d) { return d.data.attributes ? Object.keys(d.data.attributes) : []; });
        let attributes = attributeList.reduce(function(left: any, right: any) {return left.concat(right.filter(function(el){return left.indexOf(el) === -1;})); });
        this._data.metrics = attributes;
    }

    /**
     * resets all maps (deletes them)
     */
    public resetMaps() {
        this._data.revisions = [];
        this._data.metrics = [];
        this._data.comparisonMap = null;
        this._data.referenceMap = null;
        this.notify();
    }

    /**
     * Selects and sets the first map to compare.
     * @param {number} index the maps index in the revisions array
     */
    public setComparisonMap(index: number){
        this.setMetrics(index);
        this._data.comparisonMap = this._data.revisions[index];
        this.dataDecoratorService.decorateMapWithUnaryMetric(this._data.comparisonMap);
        this.dataDecoratorService.decorateMapWithUnaryMetric(this._data.referenceMap);
        this.deltaCalculatorService.decorateMapsWithDeltas(this._data.comparisonMap, this._data.referenceMap);
        this.notify();
    }

    /**
     * Selects and sets the second map to compare.
     * @param {number} index the maps index in the revisions array
     */
    public setReferenceMap(index: number){
        this.setMetrics(index);
        this._data.referenceMap = this._data.revisions[index];
        this.dataDecoratorService.decorateMapWithUnaryMetric(this._data.comparisonMap);
        this.dataDecoratorService.decorateMapWithUnaryMetric(this._data.referenceMap);
        this.deltaCalculatorService.decorateMapsWithDeltas(this._data.comparisonMap, this._data.referenceMap);
        this.notify();
    }

}