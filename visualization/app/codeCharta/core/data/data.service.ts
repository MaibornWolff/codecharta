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

    //TODO check unit tests
    //TODO check if deltas work this way
    //TODO unary metrics are 0 for merged in nodes
    public setMap(map: CodeMap, revision: number) {
        this._data.revisions[revision] = map;
        this.dataDecoratorService.decorateMapWithOriginAttribute(this._data.revisions[revision]);
        this.dataDecoratorService.decorateMapWithPathAttribute(this._data.revisions[revision]);
        this.dataDecoratorService.decorateMapWithVisibleAttribute(this._data.revisions[revision]);
        this.dataDecoratorService.decorateMapWithUnaryMetric(this._data.revisions[revision]);
        this.setMetrics(revision);
        this.dataDecoratorService.decorateEmptyAttributeLists(this._data.revisions[revision], this.data.metrics);
        this.setReferenceMap(revision);
    }

    public setReferenceMap(index: number) {
        if (this._data.revisions[index] != null) {
            this._lastReferenceIndex = index;
            this._data.renderMap = this._data.revisions[index];
            this.processDeltas(index);
            this.notify();
        }
    }

    public setComparisonMap(index: number) {
        if (this._data.revisions[index] != null) {
            this._lastComparisonMap = this._data.revisions[index];
            this.processDeltas(index);
            this.notify();
        }
    }

    private processDeltas(index: number) {
        if (this._deltasEnabled && this.data.renderMap && this._lastComparisonMap) {
            this.deltaCalculatorService.fillMapsWithNonExistingNodesFromOtherMap(this._data.renderMap,this._lastComparisonMap);
        }
    }

    public onActivateDeltas() {
        if (!this._deltasEnabled) {
            this._deltasEnabled = true;
            this.setComparisonMap(this._lastReferenceIndex);
        }
    }

    public onDeactivateDeltas() {
        if (this._deltasEnabled) {
            this._deltasEnabled = false;
            this.setComparisonMap(this._lastReferenceIndex);
        }
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



    public getReferenceMapName(): string {
        return this._data.renderMap.fileName;
    }

    public getComparisonMapName(): string {
        return this._lastComparisonMap.fileName;
    }

    public getReferenceMap(): CodeMap {
        return this._data.renderMap;
    }

    public getComparisonMap(): CodeMap {
        return this._lastComparisonMap;
    }

    /**
     * Sets metrics from a revision by id.
     * @param {number} index id
     */
    public setMetrics(index: number) {
        if (this._data.revisions[index] !== (null || undefined)) {
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

    public getIndexOfMap(map: CodeMap) {

        for(let i = 0; i<this._data.revisions.length; i++){
            if(this._data.revisions[i] && map && this._data.revisions[i].fileName === map.fileName){
                return i;
            }
        }

        return -1;

    }


}