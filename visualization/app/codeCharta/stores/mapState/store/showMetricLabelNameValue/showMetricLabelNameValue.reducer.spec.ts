import { setShowMetricLabelNameValue } from "./showMetricLabelNameValue.actions"
import { showMetricLabelNameValue } from "./showMetricLabelNameValue.reducer"

describe("showMetricLabelNameValue", () => {
    it("should set new showMetricLabelNameValue", () => {
        const result = showMetricLabelNameValue(true, setShowMetricLabelNameValue({ value: false }))

        expect(result).toEqual(false)
    })
})
