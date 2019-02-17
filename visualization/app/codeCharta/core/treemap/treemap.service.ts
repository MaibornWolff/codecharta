import {CodeMapNode, Edge, BlacklistItem, BlacklistType} from "../data/model/CodeMap";
import {Node} from "../../ui/codeMap/rendering/node";
import {DataService} from "../data/data.service";
import * as d3 from "d3";
import {hierarchy, HierarchyNode} from "d3";
import {TreeMapUtils} from "./treemap.util";
import {CodeMapUtilService} from "../../ui/codeMap/codeMap.util.service";
import {MarkedPackage} from "../settings/settings.service";

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
    searchedNodePaths: string[];
    blacklist: Array<BlacklistItem>;
    fileName: string;
    searchPattern: string;
    hideFlatBuildings: boolean;
    markedPackages: MarkedPackage[]
}

export class TreeMapService {

    private static HEIGHT_DIVISOR = 1;
    private static FOLDER_HEIGHT = 2;
    private static MIN_BUILDING_HEIGHT = 2;
    private static HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND = 0;
    private static PADDING_SCALING_FACTOR = 0.4;

    /* @ngInject */
    constructor(private dataService: DataService) {}

    public createTreemapNodes(data: CodeMapNode, s: TreeMapSettings, edges: Edge[]): Node {
        const squarified: SquarifiedValuedCodeMapNode = this.squarify(data, s, edges);
        const heighted = this.addMapScaledHeightDimensionAndFinalizeFromRoot(squarified, s);
        return heighted;
    }

    public setVisibilityOfNodeAndDescendants(node: CodeMapNode, visibility: boolean) {
        node.visible = visibility;
        hierarchy<CodeMapNode>(node).descendants().forEach((hierarchyNode) => {
            hierarchyNode.data.visible = visibility;
        });
        return node;
    }

    private squarify(data: CodeMapNode, s: TreeMapSettings, edges: Edge[]): SquarifiedValuedCodeMapNode {
        let nodes: HierarchyNode<CodeMapNode> = d3.hierarchy<CodeMapNode>(data);
        const blacklisted = CodeMapUtilService.numberOfBlacklistedNodes(nodes.descendants().map(d=>d.data), s.blacklist);
        let nodesPerSide = 2 * Math.sqrt(nodes.descendants().length - blacklisted);
        let treeMap = d3.treemap<CodeMapNode>()
            .size([s.size + nodesPerSide*s.margin, s.size + nodesPerSide*s.margin])
            .paddingOuter(s.margin * TreeMapService.PADDING_SCALING_FACTOR || 1)
            .paddingInner(s.margin * TreeMapService.PADDING_SCALING_FACTOR || 1);

        return treeMap(nodes.sum((node) => this.calculateValue(node, edges, s))) as SquarifiedValuedCodeMapNode;
    }

    private addMapScaledHeightDimensionAndFinalizeFromRoot(squaredNode: SquarifiedValuedCodeMapNode, s: TreeMapSettings): Node {
        const maxHeight = this.dataService.getMaxMetricInAllRevisions(s.heightKey);
        const heightScale = s.size / TreeMapService.HEIGHT_DIVISOR / maxHeight;
        return this.addHeightDimensionAndFinalize(squaredNode, s, heightScale, maxHeight);
    }

    private addHeightDimensionAndFinalize(squaredNode: SquarifiedValuedCodeMapNode, s: TreeMapSettings, heightScale: number, maxHeight: number, depth = 0, parent: Node = null): Node {

        let attr = squaredNode.data.attributes || {};
        let heightValue = attr[s.heightKey];

        if (heightValue === undefined || heightValue === null) {
            heightValue = TreeMapService.HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND;
        }

        if (CodeMapUtilService.isBlacklisted(squaredNode.data, s.blacklist, BlacklistType.hide)) {
            squaredNode.data = this.setVisibilityOfNodeAndDescendants(squaredNode.data, false);
        }

        const finalNode = TreeMapUtils.buildNodeFrom(squaredNode, heightScale, heightValue, maxHeight, depth, parent, s, TreeMapService.MIN_BUILDING_HEIGHT, TreeMapService.FOLDER_HEIGHT);

        if (squaredNode.children && squaredNode.children.length > 0) {
            const finalChildren: Node[] = [];
            for (let i = 0; i < squaredNode.children.length; i++) {
                finalChildren.push(this.addHeightDimensionAndFinalize(squaredNode.children[i], s, heightScale, maxHeight, depth + 1, finalNode));
            }
            finalNode.children = finalChildren;
        }
        return finalNode;

    }

    private isDeletedNodeFromComparisonMap(node: CodeMapNode, s: TreeMapSettings): boolean {
        return node &&
                node.deltas &&
                node.origin !== s.fileName &&
                node.deltas[s.heightKey] < 0 &&
                node.attributes[s.areaKey] === 0;
    }

    private calculateValue(node: CodeMapNode, edges: Edge[], s: TreeMapSettings): number {

        let result = 0;

        if(CodeMapUtilService.isBlacklisted(node, s.blacklist, BlacklistType.exclude)) {
            return 0;
        }

        if(this.isDeletedNodeFromComparisonMap(node, s)) {
            return Math.abs(node.deltas[s.areaKey]);
        }

        if ((!node.children || node.children.length === 0)) {
            if(node.attributes && node.attributes[s.areaKey]) {
                result = node.attributes[s.areaKey] || 0;
            } else {
                result = this.getEdgeValue(node, edges, s.areaKey);
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

