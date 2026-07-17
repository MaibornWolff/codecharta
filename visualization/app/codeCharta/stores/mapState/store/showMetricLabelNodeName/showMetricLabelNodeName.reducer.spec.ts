import { setShowMetricLabelNodeName } from "./showMetricLabelNodeName.actions"
import { showMetricLabelNodeName } from "./showMetricLabelNodeName.reducer"

describe("showMetricLabelNodeName", () => {
    it("should set new showMetricLabelNodeName", () => {
        const result = showMetricLabelNodeName(true, setShowMetricLabelNodeName({ value: false }))

        expect(result).toEqual(false)
    })
})
