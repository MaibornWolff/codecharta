"use strict";

import * as d3 from "d3";
import {CodeMap, CodeMapNode} from "./model/CodeMap";
import {HierarchyNode} from "d3-hierarchy";

/**
 * Decorates the data structure with artificial metrics
 */
export class DataDecoratorService {

    /* @ngInject */
    constructor() {

    }

    /**
     * Decorates the map with the unary metric. This metric is always 1 to allow the same area on all buildings.
     * @param {CodeMap} map
     */
    public decorateMapWithUnaryMetric(map: CodeMap) {

        if (map && map.root) {

            let root = d3.hierarchy<CodeMapNode>(map.root);
            let descendants: HierarchyNode<CodeMapNode>[] = root.descendants();

            for (let j = 0; j < descendants.length; j++) {
                if (!descendants[j].data.attributes) {
                    descendants[j].data.attributes = {};
                }
                Object.assign(descendants[j].data.attributes, {unary: 1});
            }

        }
    }

    public decorateMapWithVisibleAttribute(map: CodeMap) {

        if (map && map.root) {

            let root = d3.hierarchy<CodeMapNode>(map.root);
            root.each((node) => {
                node.data.visible = true;
            });

        }
    }

    public decorateMapWithOriginAttribute(map: CodeMap) {

        if (map && map.root) {

            let root = d3.hierarchy<CodeMapNode>(map.root);
            root.each((node) => {
                node.data.origin = map.fileName;
            });

        }
    }

    public decorateMapWithPathAttribute(map: CodeMap) {
        if (map && map.root) {
            let root = d3.hierarchy<CodeMapNode>(map.root);
            root.each((node) => {
                let path = root.path(node);
                let pathString = "";
                path.forEach((pnode) => {
                    pathString += "/" + pnode.data.name;
                });
                node.data.path = pathString;
            });
        }
    }

    public decorateLeavesWithMissingMetrics(maps: CodeMap[], metrics: string[]) {

        maps.forEach((map) => {
            if (map && map.root) {

                let root = d3.hierarchy<CodeMapNode>(map.root);
                root.leaves().forEach((node) => {

                    //make sure attributes exist
                    this.createAttributesIfNecessary(node);

                    //create Metrics
                    for (let i = 0; i < metrics.length; i++) {
                        let metric = metrics[i];
                        if (!node.data.attributes.hasOwnProperty(metric)) {
                            node.data.attributes[metric] = 0;
                        }
                    }

                });

            }
        });

    }

    public decorateParentNodesWithMeanAttributesOfChildren(maps: CodeMap[], metrics: string[]) {

        maps.forEach((map) => {
            if (map && map.root) {

                let root = d3.hierarchy<CodeMapNode>(map.root);
                root.each((node) => {
                    this.decorateNodeWithChildrenMeanMetrics(node, metrics);

                });

            }
        });
    }

    public decorateNodeWithChildrenMeanMetrics(node, metrics: string[]) {
        //make sure attributes exist
        this.createAttributesIfNecessary(node);

        //if attributes is empty define property for each possible metric as a mean function of child metrics
        for (let i = 0; i < metrics.length; i++) {
            let metric = metrics[i];
            if (!node.data.attributes.hasOwnProperty(metric) && node.data.children && node.data.children.length > 0) {
                this.defineAttributeAsMeanMethod(node, metric);
            }
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

    private createAttributesIfNecessary(node) {
        if (!node.data.attributes) {
            node.data.attributes = {};
        }
    }
}
