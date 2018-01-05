"use strict";

import * as d3 from "d3";
import {CodeMap, CodeMapNode} from "./model/CodeMap";
import {IRootScopeService, IAngularEvent} from "angular";
import {DeltaCalculatorService} from "./data.deltaCalculator.service";
import {DataDecoratorService} from "./data.decorator.service";
import {HierarchyNode} from "d3-hierarchy";

export interface DataModel {

    revisions: CodeMap[],
    metrics: string[],
    referenceMap: CodeMap,
    comparisonMap: CodeMap

}

export interface DataServiceSubscriber {
    onDataChanged(data: DataModel, event: IAngularEvent)
}

/**
 * This service stores and sets the current revisions, map and metrics
 */
export class DataService {

    private _data: DataModel;

    /* @ngInject */
    constructor(private $rootScope: IRootScopeService,
                private deltaCalculatorService: DeltaCalculatorService,
                private dataDecoratorService: DataDecoratorService) {

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
        if (this._data.revisions[index] !== null) {
            let root = d3.hierarchy<CodeMapNode>(this._data.revisions[index].root);
            let leaves: HierarchyNode<CodeMapNode>[] = root.leaves();
            let attributeList = leaves.map(function (d: HierarchyNode<CodeMapNode>) {
                return d.data.attributes ? Object.keys(d.data.attributes) : [];
            });
            let attributes: string[] = attributeList.reduce(function (left: string[], right: string[]) {
                return left.concat(right.filter(function (el: string) {
                    return left.indexOf(el) === -1;
                }));
            });
            this._data.metrics = attributes;
        }
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
    public setComparisonMap(index: number) {
        if (this._data.revisions[index] !== null) {
            this.setMetrics(index);
            this._data.comparisonMap = this._data.revisions[index];
            this.dataDecoratorService.decorateMapWithUnaryMetric(this._data.comparisonMap);
            this.dataDecoratorService.decorateMapWithUnaryMetric(this._data.referenceMap);
            this.dataDecoratorService.decorateMapWithOriginAttribute(this._data.comparisonMap);
            this.dataDecoratorService.decorateMapWithOriginAttribute(this._data.referenceMap);
            this.deltaCalculatorService.decorateMapsWithDeltas(this._data.comparisonMap, this._data.referenceMap);

            //TODO display node origin
            //TODO make this toggleable since two huge different maps result in two even bigger maps (performance)
            //let nodeMerge = this.deltaCalculatorService.fillMapsWithNonExistingNodesFromOtherMap(this._data.comparisonMap, this._data.referenceMap);
            //this._data.referenceMap = nodeMerge.rightMap;
            //this._data.comparisonMap = nodeMerge.leftMap;
            this.notify();
        }
    }

    /**
     * Selects and sets the second map to compare.
     * @param {number} index the maps index in the revisions array
     */
    public setReferenceMap(index: number) {
        if (this._data.revisions[index] !== null) {
            this.setMetrics(index);
            this._data.referenceMap = this._data.revisions[index];
            this.dataDecoratorService.decorateMapWithUnaryMetric(this._data.comparisonMap);
            this.dataDecoratorService.decorateMapWithUnaryMetric(this._data.referenceMap);
            this.dataDecoratorService.decorateMapWithOriginAttribute(this._data.comparisonMap);
            this.dataDecoratorService.decorateMapWithOriginAttribute(this._data.referenceMap);
            this.deltaCalculatorService.decorateMapsWithDeltas(this._data.comparisonMap, this._data.referenceMap);

            //TODO display node origin
            //TODO make this toggleable since two huge different maps result in two even bigger maps (performance)
            //let nodeMerge = this.deltaCalculatorService.fillMapsWithNonExistingNodesFromOtherMap(this._data.comparisonMap, this._data.referenceMap);
            //this._data.referenceMap = nodeMerge.rightMap;
            //this._data.comparisonMap = nodeMerge.leftMap;
            this.notify();
        }
    }

}