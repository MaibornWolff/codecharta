"use strict";

import * as d3 from "d3";
import {CodeMap, CodeMapNode} from "./model/CodeMap";
import {IRootScopeService, IAngularEvent} from "angular";
import {DeltaCalculatorService} from "./data.deltaCalculator.service";
import {DataDecoratorService} from "./data.decorator.service";
import {HierarchyNode} from "d3-hierarchy";
import {SettingsService} from "../settings/settings.service";

export interface DataModel {

    revisions: CodeMap[],
    metrics: string[],
    renderMap: CodeMap

}

export interface DataServiceSubscriber {
    onDataChanged(data: DataModel, event: IAngularEvent)
}

/**
 * This service stores and sets the current revisions, map and metrics
 */
export class DataService {

    private _data: DataModel;
    private _lastReferenceIndex = 0;
    private _lastComparisonMap = null;
    private _deltasEnabled = false;

    /* @ngInject */
    constructor(private $rootScope: IRootScopeService,
                private deltaCalculatorService: DeltaCalculatorService,
                private dataDecoratorService: DataDecoratorService) {

        this._data = {
            revisions: [],
            metrics: [],
            renderMap: null
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

    public notify() {
        this.$rootScope.$broadcast("data-changed", this._data);
    }

    /**
     * Puts a CodeMap into a given revision slot
     * @param {CodeMap} map A well formed code map
     * @param {number} revision the maps position in the revisions array
     */
    public setMap(map: CodeMap, revision: number) {
        this._data.revisions[revision] = map;
        this.dataDecoratorService.decorateMapWithOriginAttribute(this._data.revisions[revision]);
        this.setReferenceMap(revision);
    }

    public getReferenceMapName(): string {
        return this._data.renderMap.fileName;
    }

    public getComparisonMapName(): string {
        return this._lastComparisonMap.fileName;
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
        this._lastComparisonMap = null;
        this._data.renderMap = null;
        this.notify();
    }

    /**
     * Selects and sets the first map to compare.  this is the map which is substracted from the main map
     * @param {number} index the maps index in the revisions array
     */
    public setComparisonMap(index: number) { //this allows to reset delta values when switching back from delta view
        if (this._data.revisions[index] != null) {
            this._lastComparisonMap = this._data.revisions[index];
            if (this._deltasEnabled) {
                this.applyNodeMerging();
            }
            this.dataDecoratorService.decorateMapWithUnaryMetric(this._lastComparisonMap);
            this.dataDecoratorService.decorateMapWithUnaryMetric(this._data.renderMap);
            this.deltaCalculatorService.decorateMapsWithDeltas(this._lastComparisonMap, this._data.renderMap);
            this.setMetrics(index);
            this.dataDecoratorService.decorateEmptyAttributeLists(this._lastComparisonMap, this.data.metrics);
            this.dataDecoratorService.decorateEmptyAttributeLists(this._data.renderMap, this.data.metrics);

            this.setReferenceMap(this._lastReferenceIndex);

            this.notify();
        }
    }

    /**
     * Selects and sets the second map to compare. this is the main visible map
     * @param {number} index the maps index in the revisions array
     */
    public setReferenceMap(index: number) {
        if (this._data.revisions[index] != null) {
            this._lastReferenceIndex = index;
            this._data.renderMap = this._data.revisions[index];
            if (this._deltasEnabled) {
                this.applyNodeMerging();
            }
            this.dataDecoratorService.decorateMapWithUnaryMetric(this._lastComparisonMap);
            this.dataDecoratorService.decorateMapWithUnaryMetric(this._data.renderMap);
            this.deltaCalculatorService.decorateMapsWithDeltas(this._lastComparisonMap, this._data.renderMap);
            this.setMetrics(index);
            this.dataDecoratorService.decorateEmptyAttributeLists(this._lastComparisonMap, this.data.metrics);
            this.dataDecoratorService.decorateEmptyAttributeLists(this._data.renderMap, this.data.metrics);
            this.notify();
        }
    }

    //TODO "subscribe with interface" not possible because angular would produce a circular dependency
    public onActivateDeltas() {
        if (!this._deltasEnabled) {
            this._deltasEnabled = true;
            this.setComparisonMap(this._lastReferenceIndex);
            this.setReferenceMap(this._lastReferenceIndex);
        }


    }

    public onDeactivateDeltas() {
        if (this._deltasEnabled) {
            this._deltasEnabled = false;
            this.setComparisonMap(this._lastReferenceIndex);
            this.setReferenceMap(this._lastReferenceIndex);
        }
    }

    public applyNodeMerging() {
        let result = this.deltaCalculatorService.fillMapsWithNonExistingNodesFromOtherMap(
            this.deltaCalculatorService.removeCrossOriginNodes(this._data.renderMap),
            this.deltaCalculatorService.removeCrossOriginNodes(this._lastComparisonMap));

        this.dataDecoratorService.decorateMapWithUnaryMetric(result.leftMap);
        this.dataDecoratorService.decorateMapWithUnaryMetric(result.rightMap);

        //recalculate deltas on maps
        this.deltaCalculatorService.decorateMapsWithDeltas(result.leftMap, this._lastComparisonMap);


        //we should write back map changes to dataService, no need to call notify and make an infinite loop
        this._data.renderMap = result.leftMap;
        this._lastComparisonMap = result.rightMap;
    }

}