"use strict";

import * as d3 from "d3";

/**
 * This service transforms valid file data to a custom treemap. Our custom treemap has a 3rd axis added to the nodes. 
 */
class TreeMapService {

    /* @ngInject */

     /**
     * @constructor 
     * @param {DataService}
     */
    constructor(dataService) {
        /** @type {DataService} */
        this.dataService = dataService;
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
    createTreemapNodes(data, w, l, p, areaKey, heightKey){

        let treeMap = d3.treemap()
            .size([w,l])
            .padding(p || 1);
        let root = d3.hierarchy(data);

        root.descendants().forEach((l)=>{
            l.isLeaf = false;
        });

        root.leaves().forEach((l)=>{
            l.isLeaf = true;
        });

        let nodes = treeMap(root.sum((node)=>this.getArea(node, areaKey))).descendants();

        let maxHeight = this.getMaxNodeHeightInAllRevisions(heightKey);
        let heightScale = w / maxHeight;

        nodes.forEach((node)=>{
            this.transformNode(node, heightKey, p, heightScale);
        });

        return nodes.filter(function(el){return el.value > 0 && el.width > 0 && el.height > 0 && el.length > 0; }); //dont draw invisble nodes (for the current metrics)
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
     * @param {number} p padding for minimal height, padding and folder height
     * @param {number} heightScale scaling factor
     */
    transformNode(node, heightKey, p, heightScale) {

        node.width = node.x1-node.x0;
        node.length = node.y1-node.y0;
        node.height = node.isLeaf ? heightScale * node.data.attributes[heightKey]  : p;
        node.z0 = p * node.depth;
        node.z1 = p* node.depth + node.height;
        node.attributes = node.data.attributes;
        node.name = node.data.name;
        if (node.data.deltas){
            node.deltas = node.data.deltas;
        }
        node.link = node.data.link;

        node.data = {};
        delete node.data;

    }

    /**
     * Gets the height of the heighest building in all revisions in order to get a common scaling factor.
     * @param {string} heightKey name of the height metric
     * @returns {number} max height
     */
    getMaxNodeHeightInAllRevisions(heightKey) {
        var maxHeight=0;

        this.dataService.data.revisions.forEach((rev)=>{
            var nodes = d3.hierarchy(rev).leaves();
            nodes.forEach((node)=>{
                if(node.data.attributes[heightKey]>maxHeight){
                    maxHeight = node.data.attributes[heightKey];
                }
            });
        });

        return maxHeight;
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
        if(node.attributes && (!node.children || node.children.length === 0)){
            result = node.attributes[areaKey] || 0;
        }
        return result;
    }
    
}

export {TreeMapService};

