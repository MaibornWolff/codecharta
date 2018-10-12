import {CodeMapNode, Edge, Exclude, ExcludeType} from "../data/model/CodeMap";
import {node} from "../../ui/codeMap/rendering/node";
import {DataService} from "../data/data.service";
import * as d3 from "d3";
import {hierarchy, HierarchyNode} from "d3";
import {TreeMapUtils} from "./treemap.util";
import {CodeMapUtilService} from "../../ui/codeMap/codeMap.util.service";

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
    invertHeight: boolean;
    visibleEdges: Edge[];
    blacklist: Array<Exclude>;
}

export class TreeMapService {

    private static HEIGHT_DIVISOR = 1;
    private static FOLDER_HEIGHT = 2;
    private static MIN_BUILDING_HEIGHT = 2;
    private static HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND = 0;
    private static PADDING_SCALING_FACTOR = 0.4;

    /* @ngInject */
    constructor(private dataService: DataService) {}

    public createTreemapNodes(data: CodeMapNode, s: TreeMapSettings, edges: Edge[]): node {
        const squarified: SquarifiedValuedCodeMapNode = this.squarify(data, s, edges);
        const heighted = this.addMapScaledHeightDimensionAndFinalizeFromRoot(squarified, edges, s);
        return heighted;
    }

    private squarify(data: CodeMapNode, s: TreeMapSettings, edges: Edge[]): SquarifiedValuedCodeMapNode {
        let root: HierarchyNode<CodeMapNode> = d3.hierarchy<CodeMapNode>(data);
        const blacklisted = CodeMapUtilService.numberOfBlacklistedNodes(root.descendants().map(d=>d.data), s.blacklist);
        let nodesPerSide = 2 * Math.sqrt(root.descendants().length - blacklisted);
        let treeMap = d3.treemap<CodeMapNode>()
            .size([s.size + nodesPerSide*s.margin, s.size + nodesPerSide*s.margin])
            .paddingOuter(s.margin * TreeMapService.PADDING_SCALING_FACTOR || 1)
            .paddingInner(s.margin * TreeMapService.PADDING_SCALING_FACTOR || 1);

        return treeMap(root.sum((node) => this.calculateValue(node, edges, s.areaKey, s.blacklist))) as SquarifiedValuedCodeMapNode;
    }

    private addMapScaledHeightDimensionAndFinalizeFromRoot(squaredNode: SquarifiedValuedCodeMapNode, edges: Edge[], s: TreeMapSettings): node {
        const heightScale = s.size / TreeMapService.HEIGHT_DIVISOR / this.dataService.getMaxMetricInAllRevisions(s.heightKey);

        const maxHeight = this.dataService.getMaxMetricInAllRevisions(s.heightKey);
        return this.addHeightDimensionAndFinalize(squaredNode, s, heightScale, maxHeight);
    }

    private addHeightDimensionAndFinalize(squaredNode: SquarifiedValuedCodeMapNode, s: TreeMapSettings, heightScale: number, maxHeight: number, depth = 0, parent: node = null): node {

        let attr = squaredNode.data.attributes || {};
        let heightValue = attr[s.heightKey];

        if (heightValue === undefined || heightValue === null) {
            heightValue = TreeMapService.HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND;
        }

        if (heightValue === undefined || heightValue === null) {
            heightValue = TreeMapService.HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND;
        }

        if (CodeMapUtilService.isBlacklisted(squaredNode.data, s.blacklist, ExcludeType.hide)) {
            squaredNode.data = this.setVisibilityOfNodeAndDescendants(squaredNode.data, false);
        }

        const finalNode = TreeMapUtils.buildNodeFrom(squaredNode, heightScale, heightValue, maxHeight, depth, parent, s, TreeMapService.MIN_BUILDING_HEIGHT, TreeMapService.FOLDER_HEIGHT);

        if (squaredNode.children && squaredNode.children.length > 0) {
            const finalChildren: node[] = [];
            for (let i = 0; i < squaredNode.children.length; i++) {
                finalChildren.push(this.addHeightDimensionAndFinalize(squaredNode.children[i], s, heightScale, maxHeight, depth + 1, finalNode));
            }
            finalNode.children = finalChildren;
        }
        return finalNode;

    }

    public setVisibilityOfNodeAndDescendants(node: CodeMapNode, visibility: boolean) {
        node.visible = visibility;
        hierarchy<CodeMapNode>(node).descendants().forEach((hierarchyNode) => {
            hierarchyNode.data.visible = visibility;
        });
        return node;
    }

    private calculateValue(node: CodeMapNode, edges: Edge[], key: string, blacklist: Array<Exclude>): number {
        let result = 0;

        if(CodeMapUtilService.isBlacklisted(node, blacklist, ExcludeType.exclude)) {
            return 0;
        }

        if ((!node.children || node.children.length === 0)) {
            if(node.attributes && node.attributes[key]) {
                result = node.attributes[key] || 0;
            } else {
                result = this.getEdgeValue(node, edges, key);
            }
        }
        return result;
    }

    private getEdgeValue(node: CodeMapNode, edges: Edge[], key: string) {
        let filteredEdgeAttributes: number[] = [];

        if (edges) {
            edges.forEach((edge)=> {
                if (edge.fromNodeName == node.path || edge.toNodeName == node.path) {
                    filteredEdgeAttributes.push(edge.attributes[key]);
                }
            });
        }

        if (filteredEdgeAttributes) {
            return filteredEdgeAttributes.sort().reverse()[0];
        }
        return 1;
    }
}

