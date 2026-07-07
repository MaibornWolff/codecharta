import { hierarchy } from "d3-hierarchy"
import { CCFile, CodeMapNode, MetricData, NodeType } from "../../codeCharta.model"
import { NodeDecorator } from "../../util/nodeDecorator"
import { clone } from "../../util/clone"
import { _calculateIdToNode } from "./idToNode.selector"

function buildDecoratedMap(): CodeMapNode {
    // root has a single child `src`, so the structure pass merges them (root/src); `src` then branches
    // into a folder (`deep`, itself a single-child folder that is NOT merged because its child is a
    // leaf) and a leaf — exercising both mergeFolderChain and a plain branch. Decorated exactly the way
    // accumulatedData produces `unifiedMapNode`: the single structure pass (id + merge) then metrics.
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
                    {
                        name: "deep",
                        type: NodeType.FOLDER,
                        attributes: {},
                        children: [{ name: "a.ts", type: NodeType.FILE, attributes: { rloc: 10 } }]
                    },
                    { name: "c.ts", type: NodeType.FILE, attributes: { rloc: 30 } }
                ]
            }
        ]
    }
    NodeDecorator.decorateMapWithPathAttribute({ map } as CCFile)
    const metricData: Pick<MetricData, "nodeMetricData" | "edgeMetricData"> = { nodeMetricData: [], edgeMetricData: [] }
    NodeDecorator.decorateMap(map, metricData, [])
    return map
}

describe("renderModel idToNodeSelector", () => {
    it("should return an empty Map when there is no unified map node", () => {
        // Arrange & Act & Assert
        expect(_calculateIdToNode({ unifiedMapNode: undefined }).size).toBe(0)
    })

    it("should index every node of the decorated tree by its ordinal id, root at 0", () => {
        // Arrange & Act
        const idToNode = _calculateIdToNode({ unifiedMapNode: buildDecoratedMap() })

        // Assert
        expect(idToNode.get(0)?.name).toBe("root/src")
        for (const [id, node] of idToNode) {
            expect(node.id).toBe(id)
        }
    })

    // The mesh's idToBuilding keys on these exact node instances (accumulatedData.unifiedMapNode is what
    // the renderer builds from), so resolution must be by OBJECT IDENTITY: every id resolves to the same
    // node object present in the decorated tree, with the descendant-id structure a fresh walk produces.
    it("should resolve each id to the same node instance and descendant ids as the tree", () => {
        // Arrange
        const unifiedMapNode = buildDecoratedMap()

        // Act
        const idToNode = _calculateIdToNode({ unifiedMapNode })

        // Assert
        const walkedIds = hierarchy(unifiedMapNode)
            .descendants()
            .map(d => d.data.id)
        expect([...idToNode.keys()].sort((a, b) => a - b)).toEqual([...walkedIds].sort((a, b) => a - b))
        for (const { data } of hierarchy(unifiedMapNode)) {
            expect(idToNode.get(data.id)).toBe(data)
            const descendantIds = hierarchy(idToNode.get(data.id))
                .descendants()
                .map(d => d.data.id)
            const referenceIds = hierarchy(data)
                .descendants()
                .map(d => d.data.id)
            expect(descendantIds).toEqual(referenceIds)
        }
    })

    it("should neither clone nor mutate the unified map node", () => {
        // Arrange
        const unifiedMapNode = buildDecoratedMap()
        const before = clone(unifiedMapNode)

        // Act
        _calculateIdToNode({ unifiedMapNode })

        // Assert
        expect(unifiedMapNode).toEqual(before)
    })
})
