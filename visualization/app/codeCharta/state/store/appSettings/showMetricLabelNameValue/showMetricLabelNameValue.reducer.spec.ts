import { showMetricLabelNameValue } from "./showMetricLabelNameValue.reducer"
import { setShowMetricLabelNameValue } from "./showMetricLabelNameValue.actions"

describe("showMetricLabelNameValue", () => {
    it("should set new showMetricLabelNameValue", () => {
        const result = showMetricLabelNameValue(true, setShowMetricLabelNameValue({ value: false }))

        expect(result).toEqual(false)
    })
})
