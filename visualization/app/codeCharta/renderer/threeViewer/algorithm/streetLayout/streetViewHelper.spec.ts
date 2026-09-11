import { Vector2 } from "three"
import { STATE } from "../../../../mocks/dataMocks"
import { CcState, CodeMapNode, NodeType } from "../../../../model/codeCharta.model"
import Rectangle from "../../../../model/rectangle"
import { clone } from "../../../../util/clone"
import { TreeMapHelper } from "../treeMapLayout/treeMapHelper"
import { StreetViewHelper } from "./streetViewHelper"

jest.mock("../../../renderModel/accumulatedData/metricData/selectedColorMetricData.selector", () => ({
    selectedColorMetricDataSelector: () => ({ minValue: 0, maxValue: 100 })
}))

describe("StreetViewHelper", () => {
    let leafNode: CodeMapNode
    let innerNode: CodeMapNode

    beforeEach(() => {
        leafNode = {
            name: "Anode",
            path: "/root/Anode",
            type: NodeType.FILE,
            attributes: { rloc: 100 },
            edgeAttributes: { pairingRate: { incoming: 42, outgoing: 23 } }
        } as CodeMapNode

        innerNode = {
            name: "root",
            path: "/root",
            type: NodeType.FOLDER,
            attributes: {},
            children: [leafNode],
            edgeAttributes: { pairingRate: { incoming: 42, outgoing: 23 } }
        } as CodeMapNode
    })

    describe("calculateSize", () => {
        it("should be the node's attribute size", () => {
            const size = StreetViewHelper.calculateSize(leafNode, "rloc")
            expect(size).toBe(leafNode.attributes["rloc"])
        })
    })

    describe("mergeDirectories", () => {
        it("should merge directory names", () => {
            // TODO test needs to be corrected
            //const node = StreetViewHelper.mergeDirectories(innerNode, "rloc")
            //expect(node.name).toBe(innerNode.name + "/" + leafNode.name)
        })

        it("should not merge directory names", () => {
            const node = StreetViewHelper.mergeDirectories(innerNode, "rloc")
            expect(node.name).toBe(innerNode.name)
        })
    })

    describe("buildNodeFrom", () => {
        const largeHeightScale = 10
        const maxHeight = 2000
        let state: CcState

        beforeEach(() => {
            state = clone(STATE)
            state.mapState.heightMetric = "rloc"
            state.sharedView.focusedNodePath = []
            leafNode.isFlattened = true
            leafNode.rect = new Rectangle(new Vector2(0, 0), 10, 10)
            leafNode.zOffset = 1
        })

        it("should build a flattened building at the minimum height whatever its height metric value", () => {
            // Arrange
            state.mapState.invertHeight = false

            // Act
            const node = StreetViewHelper.buildNodeFrom(leafNode, largeHeightScale, maxHeight, state, false)

            // Assert
            expect(node.height).toBe(TreeMapHelper.MIN_BUILDING_HEIGHT)
        })

        it("should build a flattened building at the minimum height when the height is inverted", () => {
            // Arrange
            state.mapState.invertHeight = true

            // Act
            const node = StreetViewHelper.buildNodeFrom(leafNode, largeHeightScale, maxHeight, state, false)

            // Assert
            expect(node.height).toBe(TreeMapHelper.MIN_BUILDING_HEIGHT)
        })
    })
})
