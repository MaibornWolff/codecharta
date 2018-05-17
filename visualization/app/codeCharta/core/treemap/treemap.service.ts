import {CodeMapNode} from "../data/model/CodeMap";
import {node} from "../../ui/codeMap/rendering/node";

/**
 * This service transforms valid file data to a custom treemap. Our custom treemap has a 3rd axis added to the nodes.
 */
export class TreeMapService {

    public static SELECTOR = "treeMapService";

    /* @ngInject */
    constructor() {
    }

    createTreemapNodes(
        data: CodeMapNode,
        w: number,
        l: number,
        p: number,
        areaKey: string,
        heightKey: string
    ): node[] {
        console.log(data);
    }

   //private transformNode(node, heightKey, heightScale, folderHeight) {
   //    let heightValue = node.data.attributes[heightKey];
   //    if(heightValue === undefined || heightValue === null) {
   //        heightValue = 0;
   //    }
   //    node.width = Math.abs(node.x1 - node.x0);
   //    node.length = Math.abs(node.y1 - node.y0);
   //    node.height = Math.abs(node.isLeaf ? heightScale * heightValue : folderHeight);
   //    node.z0 = folderHeight * node.depth;
   //    node.z1 = node.z0 + node.height;
   //    node.attributes = node.data.attributes;
   //    node.name = node.data.name;
   //    if (node.data.deltas) {
   //        node.deltas = node.data.deltas;
   //        if(node.deltas[heightKey]) {
   //            node.heightDelta = heightScale * node.data.deltas[heightKey];
   //        }
   //    }
   //    node.link = node.data.link;
   //    node.origin = node.data.origin;
   //    node.visible = node.data.visible;
   //    node.path = node.data.path;

   //    node.data = {};
   //    delete node.data;

   //}

};

