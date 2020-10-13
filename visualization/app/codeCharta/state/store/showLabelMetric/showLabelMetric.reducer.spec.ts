import { showLabelMetric } from "./showLabelMetric.reducer"
import { ShowLabelMetricAction, setShowLabelMetric } from "./showLabelMetric.actions"

describe("showLabelMetric", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = showLabelMetric(undefined, {} as ShowLabelMetricAction)

			expect(result).toEqual(true)
		})
	})

	describe("Action: SET_SHOW_LABEL_METRIC", () => {
		it("should set new showLabelMetric", () => {
			const result = showLabelMetric(true, setShowLabelMetric(false))

			expect(result).toEqual(false)
		})

		it("should set default showLabelMetric", () => {
        	const result = showLabelMetric(false, setShowLabelMetric())

        	expect(result).toEqual(true)
        })
	})
})
