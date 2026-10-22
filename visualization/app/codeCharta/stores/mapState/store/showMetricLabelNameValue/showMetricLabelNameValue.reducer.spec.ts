import { setShowMetricLabelNameValue } from "./showMetricLabelNameValue.actions"
import { defaultShowMetricLabelNameValue, showMetricLabelNameValue } from "./showMetricLabelNameValue.reducer"

describe("showMetricLabelNameValue", () => {
    it("should default to showing the metric values", () => {
        expect(defaultShowMetricLabelNameValue).toBe(true)
    })

    it("should set new showMetricLabelNameValue", () => {
        const result = showMetricLabelNameValue(true, setShowMetricLabelNameValue({ value: false }))

        expect(result).toEqual(false)
    })
})
