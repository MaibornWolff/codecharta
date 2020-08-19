import {hierarchy, HierarchyNode, HierarchyRectangularNode, treemap, TreemapLayout} from "d3"
import {TreeMapHelper} from "./treeMapHelper"
import {CodeMapHelper} from "./codeMapHelper"
import {CodeMapNode, MetricData, Node, State} from "../codeCharta.model"

// 1. Build n SquarifiedTreeMaps, n = number of fixed folders
// 2. Calculate how big the ground has to be
// 3. (GroundArea / 100) *



export type SquarifiedTreeMap = { treeMap: HierarchyRectangularNode<CodeMapNode>, height: number, width: number }

export class TreeMapGenerator {
    private static PADDING_SCALING_FACTOR = 0.4

    public static createTreemapNodes(map: CodeMapNode, s: State, metricData: MetricData[], isDeltaState: boolean): Node[] {
        const maxHeight = metricData.find(x => x.name == s.dynamicSettings.heightMetric).maxValue
        const heightScale = (s.treeMap.mapSize * 2) / maxHeight

        if (this.hasFixedFolders(map)) {
            const squarifiedTreeMaps = this.buildSquarifiedTreeMapsForFixedFolders(map, s)
            const nodes: Node[] = []

            for (const squarifiedTreeMap of squarifiedTreeMaps) {
                console.log("desc", squarifiedTreeMap.treeMap.descendants())
                nodes.push(...squarifiedTreeMap.treeMap.descendants().map(squarifiedNode => {
                    // transform coordinates from local to world coordinates
                    return TreeMapHelper.buildNodeFrom(squarifiedNode, heightScale, maxHeight, s, isDeltaState)
                }))
            }

            // TODO: combine this logic into the first loop to improve performance. this is just a POC
            // transform coordinates from local to world coordinates
            for (const node of nodes) {

            }

            nodes.unshift(TreeMapHelper.buildRootFolderForFixedFolders(map, squarifiedTreeMaps, heightScale, s, isDeltaState))
            console.log("nodes", nodes)
            return nodes
        } else {
            const squarifiedTreeMap = this.getSquarifiedTreeMap(map, s)
            return squarifiedTreeMap.treeMap.descendants().map(squarifiedNode =>
                TreeMapHelper.buildNodeFrom(squarifiedNode, heightScale, maxHeight, s, isDeltaState)
            )
        }
    }

    private static hasFixedFolders(map: CodeMapNode): boolean {
        return !!map.children[0]?.fixed
    }

    private static buildSquarifiedTreeMapsForFixedFolders(map: CodeMapNode, state: State): SquarifiedTreeMap[] {
        const treeMaps: SquarifiedTreeMap[] = []

        for (const node of map.children) {
            treeMaps.push(this.getSquarifiedTreeMap(node, state))
        }

        return treeMaps
    }

    private static getSquarifiedTreeMap(map: CodeMapNode, s: State): SquarifiedTreeMap {
        const hierarchyNode: HierarchyNode<CodeMapNode> = hierarchy<CodeMapNode>(map)
        const nodeLeafs: CodeMapNode[] = hierarchyNode.descendants().map(d => d.data)
        const blacklisted: number = CodeMapHelper.numberOfBlacklistedNodes(nodeLeafs)
        const nodesPerSide: number = 2 * Math.sqrt(hierarchyNode.descendants().length - blacklisted)
        const padding: number = s.dynamicSettings.margin * TreeMapGenerator.PADDING_SCALING_FACTOR
        let mapWidth
        let mapHeight

        if (map.fixed !== undefined) {
            mapWidth = map.fixed.width
            mapHeight = map.fixed.height
        } else {
            mapWidth = s.treeMap.mapSize * 2
            mapHeight = s.treeMap.mapSize * 2
        }

        const width = mapWidth * 2 + nodesPerSide * s.dynamicSettings.margin
        const height = mapHeight * 2 + nodesPerSide * s.dynamicSettings.margin

        const treeMap: TreemapLayout<CodeMapNode> = treemap<CodeMapNode>()
            .size([width, height])
            .paddingOuter(padding)
            .paddingInner(padding)

        return {treeMap: treeMap(hierarchyNode.sum(node => this.calculateAreaValue(node, s))), height, width}
    }

    private static isOnlyVisibleInComparisonMap(node: CodeMapNode, s: State): boolean {
        return node && node.deltas && node.deltas[s.dynamicSettings.heightMetric] < 0 && node.attributes[s.dynamicSettings.areaMetric] === 0
    }

    private static calculateAreaValue(node: CodeMapNode, s: State): number {
        if (node.isExcluded) {
            return 0
        }

        if (this.isOnlyVisibleInComparisonMap(node, s)) {
            return Math.abs(node.deltas[s.dynamicSettings.areaMetric])
        }

        if (this.isNodeLeaf(node) && node.attributes && node.attributes[s.dynamicSettings.areaMetric]) {
            return node.attributes[s.dynamicSettings.areaMetric]
        }
        return 0
    }

    private static isNodeLeaf(node: CodeMapNode) {
        return !node.children || node.children.length === 0
    }
}
