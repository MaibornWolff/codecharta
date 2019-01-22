"use strict";

import * as d3 from "d3";
import {CodeMap, CodeMapNode} from "./model/CodeMap";
import {IRootScopeService, IAngularEvent} from "angular";
import {DeltaCalculatorService} from "./data.deltaCalculator.service";
import {DataDecoratorService} from "./data.decorator.service";
import {HierarchyNode} from "d3-hierarchy";

export interface MetricData {
    name: string;
    maxValue: number;
}

export interface DataModel {

    revisions: CodeMap[];
    metricData: MetricData[];
    renderMap: CodeMap;
}

export interface DataServiceSubscriber {
    onDataChanged(data: DataModel, event: IAngularEvent);
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
            metricData: [],
            renderMap: null
        };

    }

    public setMap(map: CodeMap, revision: number) {
        this._data.revisions[revision] = map;
        this.dataDecoratorService.decorateMapWithOriginAttribute(this._data.revisions[revision]);
        this.dataDecoratorService.decorateMapWithPathAttribute(this._data.revisions[revision]);
        this.dataDecoratorService.decorateMapWithVisibleAttribute(this._data.revisions[revision]);
        this.dataDecoratorService.decorateMapWithUnaryMetric(this._data.revisions[revision]);
        this.updateMetrics();
        this.dataDecoratorService.decorateLeavesWithMissingMetrics(this._data.revisions, this.getMetricNames());
        this.dataDecoratorService.decorateParentNodesWithSumAttributesOfChildren(this._data.revisions, this.getMetricNames());
        this.setReferenceMap(revision);
    }

    public setReferenceMap(index: number) {
        if (this._data.revisions[index] != null) {
            this._lastReferenceIndex = index;
            this._data.renderMap = this._data.revisions[index];
            this.processDeltas();
            this.dataDecoratorService.decorateMapWithCompactMiddlePackages(this._data.renderMap);
            this.notify();
        }
    }

    public setComparisonMap(index: number) {
        if (this._data.revisions[index] != null) {
            this._lastComparisonMap = this._data.revisions[index];
            this.processDeltas();
            this.dataDecoratorService.decorateMapWithCompactMiddlePackages(this._data.renderMap);
            this.notify();
        }
    }

    private processDeltas() {
        if(this._data.renderMap) {
            this.deltaCalculatorService.removeCrossOriginNodes(this._data.renderMap);
        }
        if (this._deltasEnabled && this._data.renderMap && this._lastComparisonMap) {
            this.deltaCalculatorService.provideDeltas(this._data.renderMap,this._lastComparisonMap, this.getMetricNames());
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

    public getMetricNames(): string[] {
        return this._data.metricData.map(m => m.name);
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

    public getIndexOfMap(map: CodeMap, mapArray: CodeMap[]):number {

        if (mapArray && map) {
            for (let i = 0; i < mapArray.length; i++) {
                if (mapArray[i] && mapArray[i].fileName === map.fileName) {
                    return i;
                }
            }
        }
        return -1;
    }

    public updateMetrics() {

        if(this._data.revisions.length <= 0){
            this._data.metricData = [];
            return; //we cannot reduce if there are no maps
        }

        let leaves: HierarchyNode<CodeMapNode>[] = [];

        this._data.revisions.forEach((map)=>{
            leaves = leaves.concat(d3.hierarchy<CodeMapNode>(map.root).leaves());
        });

        let attributeList = leaves.map(function (d: HierarchyNode<CodeMapNode>) {
            return d.data.attributes ? Object.keys(d.data.attributes) : [];
        });

        let attributes: string[] = attributeList.reduce(function (left: string[], right: string[]) {
            return left.concat(right.filter(function (el: string) {
                return left.indexOf(el) === -1;
            }));
        });

        let metricData: MetricData[] = [];

        for(const attribute of attributes) {
            metricData.push({name: attribute, maxValue: this.getMaxMetricInAllRevisions(attribute)})
        }

        this._data.metricData = metricData;
    }

    /**
     * resets all maps (deletes them)
     */
    public resetMaps() {
        this._data.revisions = [];
        this._data.metricData = [];
        this._lastComparisonMap = null;
        this._data.renderMap = null;
        this.notify();
    }

    getMaxMetricInAllRevisions(metric: string) {
        let maxValue = 0;

        this.data.revisions.forEach((rev)=> {
            let nodes = d3.hierarchy(rev.root).leaves();
            nodes.forEach((node: any)=> {
                if (node.data.attributes[metric] > maxValue) {
                    maxValue = node.data.attributes[metric];
                }
            });
        });

        return maxValue;
    }

}