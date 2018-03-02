"use strict";

import * as d3 from "d3";
import {CodeMap, CodeMapNode} from "./model/CodeMap";
import {HierarchyNode} from "d3-hierarchy";
import * as deepcopy from "deepcopy";

export interface KVObject {
    [key: string]: number
}

/**
 * Calculates the deltas between given maps and modifies the data structure
 */
export class DeltaCalculatorService {

    /* @ngInject */
    constructor() {

    }

    public makeDeltasHappen(firstMap: CodeMap, secondMap: CodeMap) {

        //make hashmaps with paths as indices
        let firstLeafHashMap = new Map<string, CodeMapNode>();
        d3.hierarchy(firstMap.root).leaves().forEach((node: HierarchyNode<CodeMapNode>) => {
            firstLeafHashMap.set(node.data.path, node.data);
        });

        let secondLeafHashMap = new Map<string, CodeMapNode>();
        d3.hierarchy(secondMap.root).leaves().forEach((node: HierarchyNode<CodeMapNode>) => {
            secondLeafHashMap.set(node.data.path, node.data);
        });

        // iterate over maps and insert nodes
        this.insertNodes(firstLeafHashMap, secondLeafHashMap, firstMap, secondMap);
        this.insertNodes(secondLeafHashMap, firstLeafHashMap, secondMap, firstMap);

        //console.log(Array.from(firstHashMap.keys()));
        //console.log(Array.from(secondHashMap.keys()));

        // add nodes from the other trees
        //let mergedMaps = this.fillMapsWithNonExistingNodesFromOtherMap(firstMap, secondMap);
        //let mergedFirstMap = mergedMaps.leftMap;
        //let mergedSecondMap = mergedMaps.rightMap;

    }

    private insertNodes(firstLeafHashMap: Map<string, CodeMapNode>, secondLeafHashMap: Map<string, CodeMapNode>, firstMap: CodeMap, secondMap: CodeMap) {
        firstLeafHashMap.forEach((node, path) => {
            console.log(path);
            if (!secondLeafHashMap.has(path)) {
                // insert node into secondHashMap and secondMap
                //secondHashMap.set(path, node); //TODO brauchen wir das ? wenn ja dann neue leere node
                let addedNode = this.deepcopy2(node);
                this.insertNodeIntoMapByPath(addedNode, secondMap);
                //secondLeafHashMap.get(insertPath).children.push(addedNode); // TODO das ist der triviale fall für blatt inserts und nicht folder
            }
        });
    }

    private insertNodeIntoMapByPath(node: CodeMapNode, insertMap: CodeMap) {
        let pathArray: string[] = node.path.split("/");

        let insertPathArray: string[] = pathArray.slice(2, pathArray.length - 1);
        let currentPathArray: string[] = pathArray.slice(0, 2);
        let current = insertMap.root;


        while (insertPathArray.length > 0) {

            let childFoundSteppingIntoIt = false;

            if (current.children) {

                for (let i = 0; i < current.children.length && !childFoundSteppingIntoIt; i++) {
                    let child = current.children[i];
                    if (child.name === insertPathArray[0]) {
                        // step into existing folder
                        current = child;
                        currentPathArray.push(insertPathArray[0]);
                        insertPathArray = insertPathArray.slice(1);
                        childFoundSteppingIntoIt = true;
                    }
                }

            } else {
                current.children = [];
            }

            if (!childFoundSteppingIntoIt) {
                //create new folder and start again
                currentPathArray.push(insertPathArray[0])

                let folder = {
                    name: insertPathArray[0],
                    path: currentPathArray.join("/"),
                    children: []
                }
                current.children.push(folder);
                current = folder;


                insertPathArray = insertPathArray.slice(1);
            }

        }

        // insert node
        if (!current.children) {
            current.children = [];
        }
        current.children.push(node);

    }

    /**
     * This requires the map to have paths. e.g.
     *
     * let dds = new DataDecoratorService();
     * dds.decorateMapWithPathAttribute(a);
     * dds.decorateMapWithPathAttribute(b);
     *
     * TODO ensure paths through typings
     *
     * @param {CodeMap} firstMap
     * @param {CodeMap} secondMap
     */
    public decorateMapsWithDeltas(firstMap: CodeMap, secondMap: CodeMap) {

        //if (firstMap && secondMap && firstMap.root && secondMap.root) {
        //    let firstRoot = d3.hierarchy<CodeMapNode>(firstMap.root);
        //    let firstLeaves: HierarchyNode<CodeMapNode>[] = firstRoot.leaves();
        //    let secondRoot = d3.hierarchy(secondMap.root);
        //    let secondLeaves: HierarchyNode<CodeMapNode>[] = secondRoot.leaves();
//
        //    for (var j = 0; j < firstLeaves.length; j++) {
        //        for (var k = 0; k < secondLeaves.length; k++) {
//
        //            let fl: HierarchyNode<CodeMapNode> = firstLeaves[j];
        //            let sl: HierarchyNode<CodeMapNode> = secondLeaves[k];
//
        //            if (fl.data.path === sl.data.path) {
        //                //calculate delta for those nodes attributes and push it to the second leave
        //                let firstDeltas = this.calculateAttributeListDelta(sl.data.attributes, fl.data.attributes);
        //                let secondDeltas = this.calculateAttributeListDelta(fl.data.attributes, sl.data.attributes);
//
        //                firstLeaves[j].data.deltas = firstDeltas;
        //                secondLeaves[k].data.deltas = secondDeltas;
//
        //            }
        //        }
        //    }
//
        //}

    }

    /**
     * Unifies both maps and inserts unique nodes into the other map. The inserted nodes have all metrics set to zero.
     * This will calculate deltas correctly between versions and add "empty" buildings to ensure all revisions have an
     * equal building pool. These empty buildings should be viewed with the unary metric as area
     * @param {CodeMap} leftMap
     * @param {CodeMap} rightMap
     * @returns {{leftMap: CodeMap; rightMap: CodeMap}}
     */
    public fillMapsWithNonExistingNodesFromOtherMap(leftMap: CodeMap, rightMap: CodeMap): { leftMap: CodeMap; rightMap: CodeMap; } {

        if (leftMap && rightMap && leftMap.root && rightMap.root) {
            console.log("HE");
            //make hashmaps with paths as indices
            let firstLeafHashMap = new Map<string, CodeMapNode>();
            d3.hierarchy(leftMap.root).leaves().forEach((node: HierarchyNode<CodeMapNode>) => {
                firstLeafHashMap.set(node.data.path, node.data);
            });

            let secondLeafHashMap = new Map<string, CodeMapNode>();
            d3.hierarchy(rightMap.root).leaves().forEach((node: HierarchyNode<CodeMapNode>) => {
                secondLeafHashMap.set(node.data.path, node.data);
            });

            // iterate over maps and insert nodes
            this.insertNodes(firstLeafHashMap, secondLeafHashMap, leftMap, rightMap);
            this.insertNodes(secondLeafHashMap, firstLeafHashMap, rightMap, leftMap);


        }

        return {leftMap: leftMap, rightMap: rightMap};

    }

    public removeCrossOriginNodes(map: CodeMap): CodeMap {
        if (map && map.root) {

            let mapCopy: CodeMap = deepcopy.default(map);

            let mapRoot = d3.hierarchy<CodeMapNode>(mapCopy.root);
            mapRoot.each((node) => {
                if (node.data.children) {
                    node.data.children = node.data.children.filter(x => (x.origin === mapCopy.fileName));
                }
            });

            return mapCopy;

        } else {
            return map;
        }
    }

    private insertLeftIntoRightWithZeroMetrics(left: HierarchyNode<CodeMapNode>, right: HierarchyNode<CodeMapNode>) {

        // are these nodes mergable (same name and have children)?
        if (left.data.name === right.data.name && left.children != undefined && right.children != undefined && left.children.length > 0 && right.children.length > 0) {

            left.children.forEach((leftChild) => {

                let leftChildExistsInRight = this.childExistsInHierarchy(right, leftChild);

                //if left child does not exist in the right node's children, insert it as a new valueless node into rights children
                if (!leftChildExistsInRight) {
                    let copy = this.deepcopy(leftChild);
                    right.data.children.push(copy.data);
                } else {

                    // if left child exists in right nodes children, skip, since we only look for direct children
                    right.children.forEach((rightChildInner) => {
                        left.children.forEach((leftChildInner) => {
                            //step in with pre-filtering
                            if (leftChildInner.data.name !== leftChild.data.name) {
                                if (leftChildInner.data.name === rightChildInner.data.name && leftChildInner.children != undefined && rightChildInner.children != undefined && leftChildInner.children.length > 0 && rightChildInner.children.length > 0) {
                                    this.insertLeftIntoRightWithZeroMetrics(leftChildInner, rightChildInner);
                                }
                            }
                        });
                    });
                }

            });

        }
    }

    private childExistsInHierarchy(hierarchy: HierarchyNode<CodeMapNode>, child: HierarchyNode<CodeMapNode>): boolean {
        let tmp = false;
        hierarchy.children.forEach((rightChild) => {
            if (child.data.name === rightChild.data.name) {
                tmp = true;
            }
        });
        return tmp;
    }

    private deepcopy(nodes: HierarchyNode<CodeMapNode>): HierarchyNode<CodeMapNode> {

        //deepcopy
        let copy: HierarchyNode<CodeMapNode> = deepcopy.default(nodes.copy()); //Hm this seems to be doing the right thing. First shallow copy then a deep copy ?!

        //make own attributes 0
        for (let property in copy.data.attributes) {
            if (copy.data.attributes.hasOwnProperty(property)) {
                copy.data.attributes[property] = 0;
            }
        }

        ////make all ancestors attributes 0
        copy.each((node) => {
            for (var property in node.data.attributes) {
                if (node.data.attributes.hasOwnProperty(property)) {
                    node.data.attributes[property] = 0;
                }
            }
        });

        return copy;

    }

    private deepcopy2(node: CodeMapNode): CodeMapNode {

        let h = d3.hierarchy(node);
        return this.deepcopy(h).data;

    }

    calculateAttributeListDelta(first: KVObject, second: KVObject) {
        let deltas = {};
        for (var key in second) {
            if (key) {
                let firstValue = first[key] ? first[key] : 0; //assume zero if no value in first
                let secondValue = second[key];
                let delta = secondValue - firstValue;
                deltas[key] = delta;
            }
        }
        return deltas;
    }

}
