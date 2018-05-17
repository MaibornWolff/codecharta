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
 *
 *  This figure shows the relation between x,y,width and length. These dimensions are only used for the treemapping.
 *  The map's height dimension is called z and is added after treemapping the floor. Z is orthogonal to the XY plane
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
        //this.scaleValuedCodeMapNodesToMapSize(valued, w, l);
        let squarified: SquarifiedValuedCodeMapNode = this.squarifyFromRoot(valued, w, l);
        let resultingNodes: node[] = [];
        this.addHeightDimension(squarified, heightKey, resultingNodes);
        return resultingNodes;
    }

    //TODO scale height to map, min values
    public addHeightDimension(squaredNode: SquarifiedValuedCodeMapNode, key: string, collected: node[] = [], depth = 0, height = 2): node {

        let finalNode = {
            name : squaredNode.data.name,
            width : Math.max(squaredNode.width,1),
            height : squaredNode.data.attributes[key],
            length : Math.max(squaredNode.length,1),
            depth : depth,
            x0 : squaredNode.x0,
            z0 : depth*height,
            y0 : squaredNode.y0,
            isLeaf : true,
            attributes : squaredNode.data.attributes,
            deltas : squaredNode.data.deltas,
            parent : null,
            heightDelta : 0,
            visible : true,
            path : "some path",
            children : []
        };

        if (squaredNode.children && squaredNode.children.length > 0) {

            //is not a building
            finalNode.isLeaf = false;
            finalNode.height = height;

            let finalChildren: node[] = [];
            for (let i = 0; i < squaredNode.children.length; i++) {
                finalChildren.push(this.addHeightDimension(squaredNode.children[i], key, collected, depth + 1));
            }
            finalNode.children = finalChildren;
        }

        collected.push(finalNode);
        return finalNode;
    }

    public squarifyFromRoot(root: ValuedCodeMapNode, containerWidth: number, containerLength: number): SquarifiedValuedCodeMapNode {

        return {
            value: root.value,
            data: root.data,
            x0: 0,
            y0: 0,
            width: containerWidth,
            length: containerLength,
            children: this.squarifyNodesIntoContainer(root.children, root.value, containerWidth, containerLength, 0, 0, 10)
        };

    }

    //TODO global paddings, aspect ratio optimization, padding per level
    public squarifyNodesIntoContainer(nodes: ValuedCodeMapNode[], containerValue: number, containerWidth: number, containerLength: number, containerX: number, containerY: number, containerPadding: number): SquarifiedValuedCodeMapNode[] {

        if(!nodes) {
            return [];
        }

        // Padding
        containerWidth -= 2*containerPadding;
        containerLength -= 2*containerPadding;
        containerX += containerPadding;
        containerY += containerPadding;

        // scale value to container
        let valuePixelScale = containerWidth * containerLength / containerValue;

        // Treemapping
        let squarifiedChildren: SquarifiedValuedCodeMapNode[] = [];
        let sortedValuedCodeMapNodes = nodes.sort((a, b) => b.value - a.value );

        let offsetX = 0;
        let offsetY = 0;

        for (let i = 0; i < sortedValuedCodeMapNodes.length; i++) {

            if(containerWidth - offsetX > containerLength - offsetY) {
                let unsquarifiedChild = sortedValuedCodeMapNodes[i];
                let squarifiedChildLength = containerLength - offsetY;
                let squarifiedChildWidth = unsquarifiedChild.value * valuePixelScale / squarifiedChildLength;
                squarifiedChildren.push({
                    value: unsquarifiedChild.value,
                    data: unsquarifiedChild.data,
                    x0: containerX + offsetX,
                    y0: containerY + offsetY,
                    width: squarifiedChildWidth,
                    length: squarifiedChildLength,
                    children: this.squarifyNodesIntoContainer(unsquarifiedChild.children, unsquarifiedChild.value, squarifiedChildWidth, squarifiedChildLength, containerX + offsetX, containerY + offsetY, containerPadding)
                });
                offsetX += squarifiedChildWidth;
            } else {
                let unsquarifiedChild = sortedValuedCodeMapNodes[i];
                let squarifiedChildWidth = containerWidth - offsetX;
                let squarifiedChildLength = unsquarifiedChild.value * valuePixelScale / squarifiedChildWidth;
                squarifiedChildren.push({
                    value: unsquarifiedChild.value,
                    data: unsquarifiedChild.data,
                    x0: containerX + offsetX,
                    y0: containerY + offsetY,
                    width: squarifiedChildWidth,
                    length: squarifiedChildLength,
                    children: this.squarifyNodesIntoContainer(unsquarifiedChild.children, unsquarifiedChild.value, squarifiedChildWidth, squarifiedChildLength, containerX + offsetX, containerY + offsetY, containerPadding)
                });
                offsetY += squarifiedChildLength;
            }

        }

        return squarifiedChildren;

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

