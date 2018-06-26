import {CodeMapNode} from "../data/model/CodeMap";
import {node} from "../../ui/codeMap/rendering/node";
import {DataService} from "../data/data.service";
import * as d3 from "d3";
import {TreeMapUtils} from "./treemap.util";
import {HierarchyNode} from "d3";

export interface ValuedCodeMapNode {
    data: CodeMapNode;
    children?: ValuedCodeMapNode[];
    value: number;
}

export interface SquarifiedValuedCodeMapNode {
    data: CodeMapNode;
    children?: SquarifiedValuedCodeMapNode[];
    parent?: SquarifiedValuedCodeMapNode;
    value: number;
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}

export interface TreeMapSettings {
    size: number;
    areaKey: string;
    heightKey: string;
    margin: number;
}

export class TreeMapService {

    private static HEIGHT_DIVISOR = 1;
    private static FOLDER_HEIGHT = 1;
    private static MIN_BUILDING_HEIGHT = 1;
    private static HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND = 0;
    private static PADDING_SCALING_FACTOR = 0.4;

    /* @ngInject */
    constructor(private dataService: DataService) {}

    public createTreemapNodes(data: CodeMapNode, s: TreeMapSettings): node {
        const squarified: SquarifiedValuedCodeMapNode = this.squarify(data, s);
        const heighted = this.addMapScaledHeightDimensionAndFinalizeFromRoot(squarified, s);
        return heighted;
    }

    private squarify(data: CodeMapNode, s: TreeMapSettings): SquarifiedValuedCodeMapNode {
        let root: HierarchyNode<CodeMapNode> = d3.hierarchy<CodeMapNode>(data);
        let nodesPerSide = 2 * Math.sqrt(root.descendants().length);
        let treeMap = d3.treemap<CodeMapNode>()
            .size([s.size + nodesPerSide*s.margin, s.size + nodesPerSide*s.margin])
            .paddingOuter(s.margin * TreeMapService.PADDING_SCALING_FACTOR || 1)
            .paddingInner(s.margin * TreeMapService.PADDING_SCALING_FACTOR || 1);

        return treeMap(root.sum((node)=>this.calculateValue(node, s.areaKey))) as SquarifiedValuedCodeMapNode;
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

    private calculateValue(node: CodeMapNode, key: string): number {
        let result = 0;
        if (node.attributes && (!node.children || node.children.length === 0)) {
            result = node.attributes[key] || 0;
        }
        return result;
    }

}

