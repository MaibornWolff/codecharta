import * as d3 from "d3";
import {DataService} from "../data/data.service";
import {CodeMap, CodeMapNode} from "../data/model/CodeMap";
import {HierarchyNode, HierarchyRectangularNode} from "d3-hierarchy";
import {node} from "../../codeMap/rendering/node";

/**
 * This service transforms valid file data to a custom treemap. Our custom treemap has a 3rd axis added to the nodes.
 */
class TreeMapService {

    public static SELECTOR = "treeMapService";

    /* @ngInject */
    constructor(private dataService: DataService) {
    }

    /**
     * creates an array of fully transformed/customized and visible {d3#treemap} nodes.
     * @external {d3#treemap} https://github.com/d3/d3-hierarchy/blob/master/README.md#treemap
     * @param {Object} data valid data
     * @param {number} w treemap width for calculation
     * @param {number} l treemap length for calculation
     * @param {number} p padding between treemap squares
     * @param {string} areaKey area metric name
     * @param {string} heightKey height metric name
     */
    createTreemapNodes(
        data: CodeMapNode,
        w: number,
        l: number,
        p: number,
        areaKey: string,
        heightKey: string
    ) {

        let treeMap = d3.treemap()
            .size([w, l])
            .padding(p || 1);

        let root = d3.hierarchy(data);

        root.descendants().forEach((l: any)=> {
            l.isLeaf = false;
        });

        root.leaves().forEach((l: any)=> {
            l.isLeaf = true;
        });

        let nodes = treeMap(root.sum((node)=>this.getArea(node, areaKey))).descendants();

        let maxHeight = this.getMaxMetricInAllRevisions(heightKey);
        let heightScale = w / maxHeight;

        nodes.forEach((node)=> {
            this.transformNode(node, heightKey, heightScale, 2);
        });

        return nodes;
    }

    /**
     * Transforms a d3 node to our specific representation. Our specification requires a third axis z.
     * -add z0 and z1 depending on treedepth and padding
     * -add w,l,h depending on data.type and x, y
     * -all we also write all important stuff into the node itself so we do not need node.data anymore (there could be obsolete data from old cc.jsons)
     * -the height of the new z axis needs to be scaled to the w/l of the {d3#treemap}
     *
     * @param {Object} node d3 node
     * @param {string} heightKey name of the height metric
     * @param {number} heightScale scaling factor
     * @param {number} folderHeight height of folder
     */
    private transformNode(node, heightKey, heightScale, folderHeight) {

        node.width = Math.max(node.x1 - node.x0, 1);
        node.length = Math.max(node.y1 - node.y0, 1);
        node.height = node.isLeaf ? heightScale * node.data.attributes[heightKey] : folderHeight;
        node.z0 = folderHeight * node.depth;
        node.z1 = folderHeight * node.depth + node.height;
        node.attributes = node.data.attributes;
        node.name = node.data.name;
        if (node.data.deltas) {
            node.deltas = node.data.deltas;
            if(node.deltas[heightKey]) {
                node.heightDelta = heightScale * node.data.deltas[heightKey];
            }
        }
        node.link = node.data.link;
        node.origin = node.data.origin;

        node.data = {};
        delete node.data;

    }

    /**
     * Gets the biggest value of a metric in the current set of revisions
     * @param {string} metric name of the metric
     * @returns {number} max value
     */
    getMaxMetricInAllRevisions(metric: string) {
        var maxValue = 0;

        this.dataService.data.revisions.forEach((rev)=> {
            var nodes = d3.hierarchy(rev.root).leaves();
            nodes.forEach((node: any)=> {
                if (node.data.attributes[metric] > maxValue) {
                    maxValue = node.data.attributes[metric];
                }
            });
        });

        return maxValue;
    }

    /**
     * Extracts the area by areakey from the node.
     *
     * @param {Object} node d3 node
     * @param {string} areaKey name of the area attribute key
     * @returns {number} area value else 0
     */
    getArea(node, areaKey) {
        let result = 0;
        if (node.attributes && (!node.children || node.children.length === 0)) {
            result = node.attributes[areaKey] || 0;
        }
        return result;
    }

}

export {TreeMapService};

