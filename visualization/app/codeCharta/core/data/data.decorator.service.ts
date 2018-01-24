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
            let leaves: HierarchyNode<CodeMapNode>[] = root.leaves();

            for (var j = 0; j < leaves.length; j++) {
                Object.assign(leaves[j].data.attributes, {unary: 1})
            }

        }
    }

    public decorateMapWithVisibleAttribute(map: CodeMap) {

        if(map && map.root) {

            let root = d3.hierarchy<CodeMapNode>(map.root);
            root.each((node)=>{
                node.data.visible = true;
            });

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

}
