import { showMetricLabelNodeName } from "./showMetricLabelNodeName.reducer"
import { setShowMetricLabelNodeName } from "./showMetricLabelNodeName.actions"

describe("showMetricLabelNodeName", () => {
    it("should set new showMetricLabelNodeName", () => {
        const result = showMetricLabelNodeName(true, setShowMetricLabelNodeName({ value: false }))

        expect(result).toEqual(false)
    })
})
