import { edgeMetric } from "./edgeMetric.reducer"
import { setEdgeMetric } from "./edgeMetric.actions"

describe("edgeMetric", () => {
    it("should set new edgeMetric", () => {
        const result = edgeMetric("mcc", setEdgeMetric({ value: "another_edge_metric" }))

        expect(result).toEqual("another_edge_metric")
    })
})
