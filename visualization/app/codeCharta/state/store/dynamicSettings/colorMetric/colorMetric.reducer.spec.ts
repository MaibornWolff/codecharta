import { colorMetric } from "./colorMetric.reducer"
import { ColorMetricAction, setColorMetric } from "./colorMetric.actions"

describe("colorMetric", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = colorMetric(undefined, {} as ColorMetricAction)

			expect(result).toBeNull()
		})
	})

	describe("Action: SET_COLOR_METRIC", () => {
		it("should set new colorMetric", () => {
			const result = colorMetric("mcc", setColorMetric("another_color_metric"))

			expect(result).toEqual("another_color_metric")
		})

		it("should set default colorMetric", () => {
			const result = colorMetric("another_color_metric", setColorMetric())

			expect(result).toBeNull()
		})
	})
})
