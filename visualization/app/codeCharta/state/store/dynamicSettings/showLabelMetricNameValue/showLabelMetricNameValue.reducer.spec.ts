import { showLabelMetricNameValue } from "./showLabelMetricNameValue.reducer"
import { ShowLabelMetricNameValueAction, setShowLabelMetricNameValue } from "./showLabelMetricNameValue.actions"

describe("showLabelMetricNameValue", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = showLabelMetricNameValue(undefined, {} as ShowLabelMetricNameValueAction)

			expect(result).toEqual(true)
		})
	})

	describe("Action: SET_SHOW_LABEL_METRIC_NAME_VALUE", () => {
		it("should set new showLabelMetricNameValue", () => {
			const result = showLabelMetricNameValue(true, setShowLabelMetricNameValue(true))

			expect(result).toEqual(true)
		})

		it("should set default showLabelMetricNameValue", () => {
        	const result = showLabelMetricNameValue(true, setShowLabelMetricNameValue())

        	expect(result).toEqual(true)
        })
	})
})
