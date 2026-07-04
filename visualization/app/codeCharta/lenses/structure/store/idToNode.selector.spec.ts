import { hierarchy } from "d3-hierarchy"
import { CCFile, CodeMapNode, MetricData, NodeType } from "../../../codeCharta.model"
import { NodeDecorator } from "../../../util/nodeDecorator"
import { clone } from "../../../util/clone"
import { _calculateIdToNode } from "./idToNode.selector"

function buildStructureTree(): CCFile {
    // root has a single child `src`, so the structure pass merges them (root/src); `src` then branches
    // into a folder (`deep`, itself a single-child folder that is NOT merged because its child is a
    // leaf) and a leaf — exercising both mergeFolderChain and a plain branch.
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
    return { map } as CCFile
}

describe("structure lens idToNodeSelector", () => {
    it("should return an empty Map when there is no structure tree", () => {
        expect(_calculateIdToNode(undefined).size).toBe(0)
        expect(_calculateIdToNode({ map: undefined } as unknown as CCFile).size).toBe(0)
    })

    it("should index every node of the structure pass by its ordinal id, root at 0", () => {
        const idToNode = _calculateIdToNode(buildStructureTree())

        expect(idToNode.get(0)?.name).toBe("root/src")
        for (const [id, node] of idToNode) {
            expect(node.id).toBe(id)
        }
    })

    // Parity: the lens-owned map must resolve the SAME id -> descendant structure as the old
    // composing-layer idToNode, which walked the fully-decorated tree. Reference = decorateMap
    // (structure pass + classify/metric decoration that does NOT change ids or shape), so the
    // keys and per-key descendant-id sets must match exactly.
    it("should resolve the same id -> descendant ids as the fully-decorated tree", () => {
        const structureTree = buildStructureTree()
        const metricData: Pick<MetricData, "nodeMetricData" | "edgeMetricData"> = { nodeMetricData: [], edgeMetricData: [] }

        const referenceMap = clone(structureTree.map)
        NodeDecorator.decorateMap(referenceMap, metricData, [])
        const referenceIdToNode = new Map<number, CodeMapNode>()
        for (const { data } of hierarchy(referenceMap)) {
            referenceIdToNode.set(data.id, data)
        }

        const idToNode = _calculateIdToNode(structureTree)

        expect([...idToNode.keys()].sort()).toEqual([...referenceIdToNode.keys()].sort())
        for (const [id, node] of idToNode) {
            const descendantIds = hierarchy(node)
                .descendants()
                .map(d => d.data.id)
            const referenceDescendantIds = hierarchy(referenceIdToNode.get(id))
                .descendants()
                .map(d => d.data.id)
            expect(descendantIds).toEqual(referenceDescendantIds)
        }
    })
})
