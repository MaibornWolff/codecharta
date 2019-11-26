import { heightMetric } from "./heightMetric.reducer"
import { HeightMetricAction, setHeightMetric } from "./heightMetric.actions"

describe("heightMetric", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = heightMetric(undefined, {} as HeightMetricAction)

			expect(result).toEqual(null)
		})
	})

	describe("Action: SET_HEIGHT_METRIC", () => {
		it("should set new heightMetric", () => {
			const result = heightMetric(null, setHeightMetric("another_height_metric"))

			expect(result).toEqual("another_height_metric")
		})
	})
})
