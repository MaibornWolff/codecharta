import {CodeMapNode} from "../data/model/CodeMap";
import {node} from "../../ui/codeMap/rendering/node";
import {DataService} from "../data/data.service";
import squarify from "squarify";
import {TreeMapUtils} from "./treemap.util";

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

export interface TreeMapSettings {
    size: number;
    areaKey: string;
    heightKey: string;
    margin: number;
}

export class TreeMapService {

    private static HEIGHT_DIVISOR = 3;
    private static FOLDER_HEIGHT = 1;
    private static MIN_BUILDING_HEIGHT = 1;
    private static START_X = 0;
    private static START_Y = 0;
    private static HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND = 0;

    /* @ngInject */
    constructor(private dataService: DataService) {}

    public createTreemapNodes(data: CodeMapNode, s: TreeMapSettings): node {
        const totalMarginPerSide = this.predictTotalMarginPerSide(data, s);
        const valued: ValuedCodeMapNode = this.valueCodeMapNodes(data, s.areaKey);
        const squarified: SquarifiedValuedCodeMapNode = this.squarifyFromRoot(valued, totalMarginPerSide, s);
        const heighted = this.addMapScaledHeightDimensionAndFinalizeFromRoot(squarified, s);
        return heighted;
    }

    private addMapScaledHeightDimensionAndFinalizeFromRoot(squaredNode: SquarifiedValuedCodeMapNode, s: TreeMapSettings): node {
        const heightScale = s.size / TreeMapService.HEIGHT_DIVISOR / this.dataService.getMaxMetricInAllRevisions(s.heightKey);
        return this.addHeightDimensionAndFinalize(squaredNode, s.heightKey, heightScale);
    }

    private addHeightDimensionAndFinalize(squaredNode: SquarifiedValuedCodeMapNode, key: string, heightScale: number, depth = 0, parent: node = null): node {

        let heightValue = squaredNode.data.attributes[key];

        if (heightValue === undefined || heightValue === null) {
            heightValue = TreeMapService.HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND;
        }

        const finalNode = TreeMapUtils.buildNodeFrom(squaredNode, heightScale, heightValue, depth, parent, key,TreeMapService.MIN_BUILDING_HEIGHT, TreeMapService.FOLDER_HEIGHT);

        if (squaredNode.children && squaredNode.children.length > 0) {
            const finalChildren: node[] = [];
            for (let i = 0; i < squaredNode.children.length; i++) {
                finalChildren.push(this.addHeightDimensionAndFinalize(squaredNode.children[i], key, heightScale, depth + 1, finalNode));
            }
            finalNode.children = finalChildren;
        }
        return finalNode;

    }

    private squarifyFromRoot(root: ValuedCodeMapNode, totalMarginPerSide: number, s: TreeMapSettings): SquarifiedValuedCodeMapNode {

        const containerWidth = s.size + totalMarginPerSide;
        const containerLength = s.size + totalMarginPerSide;

        return {
            value: root.value,
            data: root.data,
            x0: TreeMapService.START_X,
            y0: TreeMapService.START_Y,
            width: containerWidth,
            length: containerLength,
            children: this.squarifyNodesIntoContainer(root.children, containerWidth, containerLength, TreeMapService.START_X, TreeMapService.START_Y, 1, s)
        };

    }

    private squarifyNodesIntoContainer(nodes: ValuedCodeMapNode[], containerWidth: number, containerLength: number, containerX: number, containerY: number, depth: number, s: TreeMapSettings): SquarifiedValuedCodeMapNode[] {

        if (!nodes) {return [];}

        const input = [];
        const container = {
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

            let effectiveMarginRelativeToNodeSize = s.margin*this.predictTotalMarginPerSide(output[i], s);

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
                    depth + 1,
                    s
                )
            });
        }

        return squarifiedChildren;

    }

    private valueCodeMapNodes(node: CodeMapNode, key: string): ValuedCodeMapNode {

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

    private calculateValue(node: CodeMapNode, key: string): number {
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

    private predictTotalMarginPerSide(node: { children?: any }, s: TreeMapSettings): number {
        return Math.sqrt(TreeMapUtils.countNodes(node)) * s.margin * 2;
    }

}

