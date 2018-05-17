import {CodeMapNode} from "../data/model/CodeMap";
import {node} from "../../ui/codeMap/rendering/node";
import {DataService} from "../data/data.service";

export interface ValuedCodeMapNode {
    data: CodeMapNode;
    children?: ValuedCodeMapNode[];
    value: number;
}

export class TreeMapService {

    public static SELECTOR = "treeMapService";

    /* @ngInject */
    constructor(private dataService: DataService) {
    }

    public createTreemapNodes(data: CodeMapNode,
                              w: number,
                              l: number,
                              areaKey: string,
                              x0: number = 0,
                              y0: number = 0,
    ): node {



    }

    public valueCodeMapNodes(node: CodeMapNode, key: string): ValuedCodeMapNode {

        let valuedNode: ValuedCodeMapNode = {
            value: node.calculateValue(key),
            data: node
        };

        if (node.children) {
            let valuedChildren: ValuedCodeMapNode = [];
            for (let i = 0; i < node.children.length; i++) {
                valuedChildren.push(this.valueCodeMapNodes(node.children[i], key));
            }
            valuedNode.children = valuedChildren;
        }

        return valuedNode;
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
//
    //    node.data = {};
    //    delete node.data;
//
    //}

}

