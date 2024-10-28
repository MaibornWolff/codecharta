import { getEdge, primaryMetricsSelector } from "./primaryMetrics.selector"
import { VALID_NODE_WITH_MCC } from "../../../util/dataMocks"
import { klona } from "klona"

describe(primaryMetricsSelector.name, () => {
    it("should return 0 when no edge metric count is defined", () => {
        const node = klona(VALID_NODE_WITH_MCC)
        node.edgeAttributes = { avgCommits: undefined }
        const edge = getEdge("avgCommits", node)
        expect(edge).toEqual({
            name: "avgCommits",
            incoming: 0,
            outgoing: 0
        })
    })

    it("should return the correct metrics count when incoming and outgoing edge metrics are defined", () => {
        const node = klona(VALID_NODE_WITH_MCC)
        node.edgeAttributes = { avgCommits: { incoming: 4, outgoing: 1 } }
        const edge = getEdge("avgCommits", node)
        expect(edge).toEqual({
            name: "avgCommits",
            incoming: 4,
            outgoing: 1
        })
    })

    it("should return 0 when incoming and outgoing edge metrics are not defined", () => {
        const node = klona(VALID_NODE_WITH_MCC)
        node.edgeAttributes = { avgCommits: { incoming: undefined, outgoing: null } }
        const edge = getEdge("avgCommits", node)
        expect(edge).toEqual({
            name: "avgCommits",
            incoming: 0,
            outgoing: 0
        })
    })
})
