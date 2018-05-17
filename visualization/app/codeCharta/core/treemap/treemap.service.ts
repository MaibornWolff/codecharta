import {CodeMapNode} from "../data/model/CodeMap";
import {node} from "../../ui/codeMap/rendering/node";
import {DataService} from "../data/data.service";

export interface ValuedCodeMapNode {
    data: CodeMapNode;
    children?: ValuedCodeMapNode[];
    value: number;
}

export interface SquarifiedValuedCodeMapNode {
    data: CodeMapNode;
    children?: SquarifiedValuedCodeMapNode[];
    value: number;
    x0: number;
    y0: number;
    width: number;
    length: number;
}

/**
 *  Y
 * y1       *-------*
 *  |       |       |
 *  |       l       |
 *  |       e       |
 *  |       n       |
 *  |       g       |
 *  |       t       |
 *  |       h       |
 *  |       |       |
 * y0       *-width-*
 *  |
 *  0 - - - x0- - - x1 - - X
 */
export class TreeMapService {

    public static SELECTOR = "treeMapService";

    /* @ngInject */
    constructor(private dataService: DataService) {
    }

    public createTreemapNodes(data: CodeMapNode,
                              w: number,
                              l: number,
                              areaKey: string,
                              heightKey: string
    ): node[] {
        let valued: ValuedCodeMapNode = this.valueCodeMapNodes(data, areaKey);
        let squarified: SquarifiedValuedCodeMapNode = this.squarify(valued, w, l);
        let resultingNodes: node[] = [];
        this.addHeightDimension(squarified, heightKey, resultingNodes);
        return resultingNodes;
    }

    public addHeightDimension(squaredNode: SquarifiedValuedCodeMapNode, key: string, collected: node[] = [], depth = 0, height = 5): node {

        let finalNode = {
            name : squaredNode.data.name,
            width : squaredNode.width,
            height : height,
            length : squaredNode.length,
            depth : depth,
            x0 : squaredNode.x0,
            z0 : depth*height,
            y0 : squaredNode.y0,
            isLeaf : false,
            attributes : squaredNode.data.attributes,
            deltas : squaredNode.data.deltas,
            parent : null,
            heightDelta : 0,
            visible : true,
            path : "some path",
            children : []
        };

        if (squaredNode.children) {
            let finalChildren: node[] = [];
            for (let i = 0; i < squaredNode.children.length; i++) {
                finalChildren.push(this.addHeightDimension(squaredNode.children[i], key, collected, depth + 1));
            }
            finalNode.children = finalChildren;
        }

        collected.push(finalNode);
        return finalNode;
    }

    public squarify(node: ValuedCodeMapNode, containerWidth: number, containerLength: number, xContainerOffset: number = 0, yContainerOffset = 0): SquarifiedValuedCodeMapNode {

        let squarifiedNode: SquarifiedValuedCodeMapNode = {
            value: node.value,
            data: node.data,
            x0: xContainerOffset,
            y0: yContainerOffset,
            width: containerWidth,
            length: containerLength,
        };

        if (node.children) {
            let squarifiedChildren: SquarifiedValuedCodeMapNode[] = [];
            let sortedValuedCodeMapNodes = node.children.sort((a, b) => a.value - b.value); //TODO - or + ?

            let xRowOffset = xContainerOffset;
            let yRowOffset = yContainerOffset;

            for (let i = 0; i < sortedValuedCodeMapNodes.length; i++) {

                let x0 = xRowOffset;
                let y0 = yRowOffset;
                let childWidth = 0;
                let childLength = 0;

                if (containerWidth + xContainerOffset - xRowOffset> containerLength + yContainerOffset - yRowOffset) {
                    childLength = containerLength;
                    childWidth = sortedValuedCodeMapNodes[i].value / containerLength;
                    xRowOffset += childWidth;
                } else {
                    childWidth = containerWidth;
                    childLength = sortedValuedCodeMapNodes[i].value / containerWidth;
                    yRowOffset += childLength;
                }

                squarifiedChildren.push({
                    value: sortedValuedCodeMapNodes[i].value,
                    data: sortedValuedCodeMapNodes[i].data,
                    x0: x0,
                    y0: y0,
                    width: childWidth,
                    length: childLength,
                });

                //TODO recursion, step back when aspect ratio gets worse

            }
            squarifiedNode.children = squarifiedChildren;
        }

        return squarifiedNode;

    }

    public valueCodeMapNodes(node: CodeMapNode, key: string): ValuedCodeMapNode {

        let valuedNode: ValuedCodeMapNode = {
            value: this.calculateValue(node, key),
            data: node
        };

        if (node.children) {
            let valuedChildren: ValuedCodeMapNode[] = [];
            for (let i = 0; i < node.children.length; i++) {
                valuedChildren.push(this.valueCodeMapNodes(node.children[i], key));
            }
            valuedNode.children = valuedChildren;
        }

        return valuedNode;
    }

    public calculateValue(node: CodeMapNode, key: string): number {
        let value = 0;
        if(node.children && node.children.length > 0){
            for (let i=0; i<node.children.length; i++) {
                value += this.calculateValue(node.children[i],key);
            }
        } else if(node.attributes && node.attributes[key]) {
            value += node.attributes[key];
        }
        return value;
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

