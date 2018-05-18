import {CodeMapNode} from "../data/model/CodeMap";
import {node} from "../../ui/codeMap/rendering/node";
import {DataService} from "../data/data.service";
import squarify from "squarify";

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

    public createTreemapNodesSquared(data: CodeMapNode, mapSize: number, areaKey: string, heightKey: string, margin: number, fanoutDepths: number[], fanoutScale: number): node {
        return this.createTreemapNodes(data, mapSize, mapSize, mapSize, areaKey, heightKey, margin, fanoutDepths, fanoutScale);
    }

    public createTreemapNodes(data: CodeMapNode, w: number, l: number, h: number, areaKey: string, heightKey: string, margin: number, fanoutDepths: number[], fanoutScale: number): node {
        let totalMarginPerSide = this.predictTotalMarginPerSide(data, margin, fanoutDepths, fanoutScale);
        let valued: ValuedCodeMapNode = this.valueCodeMapNodes(data, areaKey);
        let squarified: SquarifiedValuedCodeMapNode = this.squarifyFromRoot(valued, w + totalMarginPerSide, l + totalMarginPerSide, margin, fanoutDepths, fanoutScale);
        let heighted = this.addMapScaledHeightDimensionAndFinalizeFromRoot(squarified, heightKey, (h + totalMarginPerSide)/3);
        return heighted;
    }

    public addMapScaledHeightDimensionAndFinalizeFromRoot(squaredNode: SquarifiedValuedCodeMapNode, key: string, targetMaxHeight: number, folderHeight = 1): node {
        return this.addHeightDimensionAndFinalize(squaredNode, key, targetMaxHeight / this.dataService.getMaxMetricInAllRevisions(key), 0, null, folderHeight);
    }

    public addHeightDimensionAndFinalize(squaredNode: SquarifiedValuedCodeMapNode, key: string, heightScale: number, depth, parent: node, folderHeight): node {

        let heightValue = squaredNode.data.attributes[key];
        if (heightValue === undefined || heightValue === null) {
            heightValue = 0;
        }

        let finalNode: node = {
            name: squaredNode.data.name,
            width: squaredNode.width,
            height: Math.abs(squaredNode.children && squaredNode.children.length <= 0 ? Math.max(heightScale * heightValue, folderHeight) : folderHeight),
            length: squaredNode.length,
            depth: depth,
            x0: squaredNode.x0,
            z0: depth * folderHeight,
            y0: squaredNode.y0,
            isLeaf: squaredNode.children && squaredNode.children.length <= 0,
            attributes: squaredNode.data.attributes,
            deltas: squaredNode.data.deltas,
            parent: parent,
            heightDelta: Math.abs(squaredNode.data.deltas && squaredNode.data.deltas[key] ? heightScale * squaredNode.data.deltas[key] : 0),
            visible: squaredNode.data.visible,
            path: squaredNode.data.path,
            origin: squaredNode.data.origin,
            link: squaredNode.data.link,
            children: []
        };

        if (squaredNode.children && squaredNode.children.length > 0) {

            let finalChildren: node[] = [];
            for (let i = 0; i < squaredNode.children.length; i++) {
                finalChildren.push(this.addHeightDimensionAndFinalize(squaredNode.children[i], key, heightScale, depth + 1, finalNode, folderHeight));
            }
            finalNode.children = finalChildren;
        }

        return finalNode;
    }

    public squarifyFromRoot(root: ValuedCodeMapNode, containerWidth: number, containerLength: number, margin: number, fanoutDepths: number[], fanoutScale: number): SquarifiedValuedCodeMapNode {

        return {
            value: root.value,
            data: root.data,
            x0: 0,
            y0: 0,
            width: containerWidth,
            length: containerLength,
            children: this.squarifyNodesIntoContainer(root.children, containerWidth, containerLength, 0, 0, margin, 1, fanoutDepths, fanoutScale)
        };

    }

    public squarifyNodesIntoContainer(nodes: ValuedCodeMapNode[], containerWidth: number, containerLength: number, containerX: number, containerY: number, margin: number, depth: number, fanoutDepths: number[], fanoutScale: number): SquarifiedValuedCodeMapNode[] {

        if (!nodes) {
            return [];
        }

        let input = [];
        let container = {
            x0: containerX,
            y0: containerY,
            x1: containerX + containerWidth,
            y1: containerY + containerLength
        };

        for (let i = 0; i < nodes.length; i++) {
            input.push({
                ref: nodes[i],
                value: nodes[i].value
            })
        }

        let output = squarify(input.sort((a, b) => b.value - a.value), container);

        let squarifiedChildren: SquarifiedValuedCodeMapNode[] = [];

        for (let i = 0; i < output.length; i++) {

            let effectiveMargin = margin;
            if (fanoutDepths.includes(depth)) {
                effectiveMargin *= fanoutScale;
            }
            let effectiveMarginRelativeToNodeSize = effectiveMargin*this.predictTotalMarginPerSide(output[i], margin, fanoutDepths, fanoutScale);

            squarifiedChildren.push({
                value: output[i].value,
                data: output[i].ref.data,
                x0: output[i].x0 + effectiveMarginRelativeToNodeSize / 2,
                y0: output[i].y0 + effectiveMarginRelativeToNodeSize / 2,
                width: output[i].x1 - output[i].x0 - effectiveMarginRelativeToNodeSize,
                length: output[i].y1 - output[i].y0 - effectiveMarginRelativeToNodeSize,
                children: this.squarifyNodesIntoContainer(
                    output[i].ref.children,
                    output[i].x1 - output[i].x0 - effectiveMarginRelativeToNodeSize,
                    output[i].y1 - output[i].y0 - effectiveMarginRelativeToNodeSize,
                    output[i].x0 + effectiveMarginRelativeToNodeSize / 2,
                    output[i].y0 + effectiveMarginRelativeToNodeSize / 2,
                    margin,
                    depth + 1,
                    fanoutDepths,
                    fanoutScale
                )
            });
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
        if (node.children && node.children.length > 0) {
            for (let i = 0; i < node.children.length; i++) {
                value += this.calculateValue(node.children[i], key);
            }
        } else if (node.attributes && node.attributes[key]) {
            value += node.attributes[key];
        }
        return value;
    }

    public predictTotalMarginPerSide(node: { children?: any }, margin: number, fanoutDepths: number[],fanoutScale: number): number {

        let margins = [margin];
        fanoutDepths.forEach(d=>margins.push(margin*fanoutScale));
        let avgMargin = 0;
        margins.forEach((m)=>{avgMargin+=m;});
        avgMargin /= margins.length * 2;
        return Math.sqrt(this.countNodes(node)) * avgMargin * 2;
    }

    public countNodes(node: { children?: any }): number {
        let count = 1;
        if (node.children && node.children.length > 0) {
            for (let i = 0; i < node.children.length; i++) {
                count += this.countNodes(node.children[i]);
            }
        }
        return count;
    }

}

