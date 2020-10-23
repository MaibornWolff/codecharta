import { showMetricLabelNameValue } from "./showMetricLabelNameValue.reducer"
import { ShowMetricLabelNameValueAction, setShowMetricLabelNameValue } from "./showMetricLabelNameValue.actions"

describe("showMetricLabelNameValue", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = showMetricLabelNameValue(undefined, {} as ShowMetricLabelNameValueAction)

			expect(result).toEqual(true)
		})
	})

	describe("Action: SET_SHOW_METRIC_LABEL_NAME_VALUE", () => {
		it("should set new showMetricLabelNameValue", () => {
			const result = showMetricLabelNameValue(true, setShowMetricLabelNameValue(false))

			expect(result).toEqual(false)
		})

		it("should set default showMetricLabelNameValue", () => {
			const result = showMetricLabelNameValue(false, setShowMetricLabelNameValue())

			expect(result).toEqual(true)
		})
	})
})
