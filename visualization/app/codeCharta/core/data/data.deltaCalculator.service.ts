"use strict";

import * as d3 from "d3";
import {CodeMap, CodeMapNode} from "./model/CodeMap";
import {HierarchyNode} from "d3-hierarchy";

interface KVObject {
    [key: string]: number
}

/**
 * Calculates the deltas between given maps and modifies the data structure
 */
export class DeltaCalculatorService {

    /* @ngInject */
    constructor(){

    }

    public decorateMapsWithDeltas(firstMap: CodeMap, secondMap: CodeMap) {

        if(firstMap && secondMap && firstMap.root && secondMap.root) {
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

    private calculateAttributeListDelta(first: KVObject, second: KVObject){
        let deltas = {};
        for (var key in second) {
            if(key) {
                let firstValue = first[key] ? first[key] : 0; //assume zero if no value in first
                let secondValue = second[key];
                let delta = secondValue - firstValue;
                deltas[key] = delta;
            }
        }
        return deltas;
    }

}
