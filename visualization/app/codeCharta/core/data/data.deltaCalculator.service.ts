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

    public decorateMapsWithDeltas(firstMap: CodeMap, secondMap: CodeMap) {

        if (firstMap && secondMap && firstMap.root && secondMap.root) {
            let firstRoot = d3.hierarchy<CodeMapNode>(firstMap.root);
            let firstLeaves: HierarchyNode<CodeMapNode>[] = firstRoot.leaves();
            let secondRoot = d3.hierarchy(secondMap.root);
            let secondLeaves: HierarchyNode<CodeMapNode>[] = secondRoot.leaves();

            for (var j = 0; j < firstLeaves.length; j++) {
                for (var k = 0; k < secondLeaves.length; k++) {

                    let fl: HierarchyNode<CodeMapNode> = firstLeaves[j];
                    let sl: HierarchyNode<CodeMapNode> = secondLeaves[k];

                    if (fl.data.name === sl.data.name) {
                        //calculate delta for those nodes attributes and push it to the second leave
                        let firstDeltas = this.calculateAttributeListDelta(sl.data.attributes, fl.data.attributes);
                        let secondDeltas = this.calculateAttributeListDelta(fl.data.attributes, sl.data.attributes);

                        firstLeaves[j].data.deltas = firstDeltas;
                        secondLeaves[k].data.deltas = secondDeltas;

                    }
                }
            }

        }

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

            let leftMapCopy: CodeMap = deepcopy.default(leftMap);
            let rightMapCopy: CodeMap = deepcopy.default(rightMap);

            let leftRoot = d3.hierarchy<CodeMapNode>(leftMapCopy.root);
            let rightRoot = d3.hierarchy<CodeMapNode>(rightMapCopy.root);

            this.insertLeftIntoRightWithZeroMetrics(leftRoot, rightRoot);
            this.insertLeftIntoRightWithZeroMetrics(rightRoot, leftRoot);

            return {leftMap: leftMapCopy, rightMap: rightMapCopy};

        } else {
            return {leftMap: leftMap, rightMap: rightMap};
        }
    }

    public removeCrossOriginNodes(map: CodeMap): CodeMap {
        if (map && map.root) {

            let mapCopy: CodeMap = deepcopy.default(map);

            let mapRoot = d3.hierarchy<CodeMapNode>(mapCopy.root);
            mapRoot.each((node)=>{
                if(node.data.children) {
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
