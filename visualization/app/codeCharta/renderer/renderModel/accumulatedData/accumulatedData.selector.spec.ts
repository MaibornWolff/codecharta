import { hierarchy } from "d3-hierarchy"
import { CCFile, CodeMapNode, FileSelectionState, FileState, NodeType } from "../../../model/codeCharta.model"
import { NodeEdgeMetricsMap } from "../../../model/domain.model"
import { NodeDecorator } from "../../../util/nodeDecorator"
import { accumulatedDataSelector } from "./accumulatedData.selector"
import { _calculateIdToNode } from "./idToNode.selector"

function buildStructureTree(): CCFile {
    // Single-child root (root/src merge) with two leaves — undecorated, as the structure lens yields it.
    const map: CodeMapNode = {
        name: "root",
        type: NodeType.FOLDER,
        attributes: {},
        children: [
            {
                name: "src",
                type: NodeType.FOLDER,
                attributes: {},
                children: [
                    { name: "a.ts", type: NodeType.FILE, attributes: { rloc: 10 } },
                    { name: "b.ts", type: NodeType.FILE, attributes: { rloc: 30 } }
                ]
            }
        ]
    }
    NodeDecorator.decorateMapWithPathAttribute({ map } as CCFile)
    return { map } as CCFile
}

function runProjector(structureTree: CCFile) {
    const metricData = {
        nodeMetricData: [],
        edgeMetricData: [],
        nodeEdgeMetricsMap: new Map() as NodeEdgeMetricsMap
    }
    const fileStates = [{ selectedAs: FileSelectionState.Partial } as FileState]
    return accumulatedDataSelector.projector(metricData, fileStates, structureTree, {}, {}, [], [])
}

describe("accumulatedDataSelector", () => {
    it("should decorate a CLONE, leaving the upstream structure tree untouched", () => {
        // Arrange
        const structureTree = buildStructureTree()

        // Act
        const { unifiedMapNode } = runProjector(structureTree)

        // Assert — the memoized structureTree instance must never gain ids or a merged shape (regression
        // guard for the clone before decoration; mutating it would corrupt every later read).
        expect(unifiedMapNode).toBeDefined()
        expect(structureTree.map.id).toBeUndefined()
        expect(structureTree.map.name).toBe("root")
        expect(structureTree.map.children).toHaveLength(1)
    })

    it("should assign unique ordinal ids from a single structure pass, root at 0", () => {
        // Act
        const { unifiedMapNode } = runProjector(buildStructureTree())

        // Assert — root/src merged exactly once (single mergeFolderChain); the merged-away node consumes
        // an id that becomes unreachable, so reachable ids are unique but NOT contiguous (root === 0).
        expect(unifiedMapNode?.name).toBe("root/src")
        expect(unifiedMapNode?.id).toBe(0)
        const ids = hierarchy(unifiedMapNode)
            .descendants()
            .map(d => d.data.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    it("should carry ids the renderModel idToNode selector resolves identically (mesh parity)", () => {
        // Arrange
        const accumulatedData = runProjector(buildStructureTree())

        // Act — the relocated idToNode indexes the SAME decorated tree the mesh builds from.
        const idToNode = _calculateIdToNode(accumulatedData)

        // Assert — keys equal the tree's ids, and each resolves to the identical node instance.
        for (const { data } of hierarchy(accumulatedData.unifiedMapNode)) {
            expect(idToNode.get(data.id)).toBe(data)
        }
        const treeIds = hierarchy(accumulatedData.unifiedMapNode)
            .descendants()
            .map(d => d.data.id)
        expect([...idToNode.keys()].sort((a, b) => a - b)).toEqual([...treeIds].sort((a, b) => a - b))
    })
})
