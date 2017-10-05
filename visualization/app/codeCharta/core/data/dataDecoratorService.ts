"use strict";

import * as d3 from "d3";
import {CodeMap} from "./model/CodeMap";

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

        if(map.root) {

            let root = d3.hierarchy(map.root);
            let leaves = root.leaves();

            for (var j = 0; j < leaves.length; j++) {
                leaves[j].data.attributes.unary = 1;
            }

        }
    }

}
