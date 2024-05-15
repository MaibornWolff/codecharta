import {
    setIsColorMetricLinkedToHeightMetricAction,
    toggleIsColorMetricLinkedToHeightMetric
} from "./isColorMetricLinkedToHeightMetric.actions"
import { isColorMetricLinkedToHeightMetric } from "./isColorMetricLinkedToHeightMetric.reducer"

describe("isColorMetricLinkedToHeightMetric", () => {
    describe("Action: TOGGLE_IS_COLOR_METRIC_LINKED_TO_HEIGHT_METRIC", () => {
        it("should toggle state", () => {
            const result = isColorMetricLinkedToHeightMetric(false, toggleIsColorMetricLinkedToHeightMetric())
            const toggleResult = isColorMetricLinkedToHeightMetric(result, toggleIsColorMetricLinkedToHeightMetric())

            expect(result).toBe(!toggleResult)
        })
    })

    describe("Action: SET_IS_COLOR_METRIC_LINKED_TO_HEIGHT_METRIC", () => {
        it("should set new isColorMetricLinkedToHeightMetric state", () => {
            const isLinked = isColorMetricLinkedToHeightMetric(false, setIsColorMetricLinkedToHeightMetricAction({ value: true }))
            const isNotLinked = isColorMetricLinkedToHeightMetric(isLinked, setIsColorMetricLinkedToHeightMetricAction({ value: false }))

            expect(isLinked).not.toBe(isNotLinked)
        })
    })
})
