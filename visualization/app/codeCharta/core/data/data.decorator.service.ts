"use strict";

import * as d3 from "d3";
import {CodeMap, CodeMapNode} from "./model/CodeMap";
import {HierarchyNode} from "d3-hierarchy";

/**
 * Decorates the data structure with artificial metrics
 */
export class DataDecoratorService {

    /* @ngInject */
    constructor(){

    }

    /**
     * Decorates the map with the unary metric. This metric is always 1 to allow the same area on all buildings.
     * @param {CodeMap} map
     */
    public decorateMapWithUnaryMetric(map: CodeMap) {

        if(map && map.root) {

            let root = d3.hierarchy<CodeMapNode>(map.root);
            let descendants: HierarchyNode<CodeMapNode>[] = root.descendants();

            for (var j = 0; j < descendants.length; j++) {
                if(!descendants[j].data.attributes) {
                    descendants[j].data.attributes = {};
                }
                Object.assign(descendants[j].data.attributes, {unary: 1})
            }

        }
    }

    public decorateMapWithOriginAttribute(map: CodeMap) {

        if(map && map.root) {

            let root = d3.hierarchy<CodeMapNode>(map.root);
            root.each((node)=>{
                node.data.origin = map.fileName;
            });

        }
    }


    public decorateEmptyAttributeLists(map: CodeMap, metrics: string[]) {

        if(map && map.root) {

            let root = d3.hierarchy<CodeMapNode>(map.root);
            root.each((node)=>{

                //make sure attributes exist
                this.createAttributesIfNecessary(node);

                //count attributes except unary
                let attributesCounter = this.countAttributesExceptUnary(node);

                //if attributes is empty define property for each possible metric as a mean function of child metrics
                for(let i=0;i<metrics.length;i++) {
                    let metric = metrics[i];
                    if (attributesCounter == 0 && !node.data.attributes.hasOwnProperty(metric) && node.data.children ) {
                        this.defineAttributeAsMeanMethod(node, metric);
                    }
                }

            });

        }
    }

    private defineAttributeAsMeanMethod(node, metric: string) {
        Object.defineProperty(node.data.attributes, metric, {
            enumerable: true,
            get: function () {
                let count = 0;
                let sum = 0;
                let l = node.leaves();
                for (; count < l.length; count++) {
                    sum += l[count].data.attributes[metric];
                }
                return sum / count;
            }
        });
    }

    private countAttributesExceptUnary(node) {
        let attributesCounter = 0;
        for (let attribute in node.data.attributes) {
            if (node.data.attributes.hasOwnProperty(attribute)) {
                if (attribute !== "unary") {
                    attributesCounter++;
                }
            }
        }
        return attributesCounter;
    }

    private createAttributesIfNecessary(node) {
        if (!node.data.attributes) {
            node.data.attributes = {};
        }
    }
}
