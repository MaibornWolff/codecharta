import { areaMetric } from "./areaMetric.reducer"
import { AreaMetricAction, setAreaMetric } from "./areaMetric.actions"

describe("areaMetric", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = areaMetric(undefined, {} as AreaMetricAction)

			expect(result).toBeNull()
		})
	})

	describe("Action: SET_AREA_METRIC", () => {
		it("should set new areaMetric", () => {
			const result = areaMetric("mcc", setAreaMetric("another_area_metric"))

			expect(result).toEqual("another_area_metric")
		})

		it("should set new areaMetric", () => {
			const result = areaMetric("another_area_metric", setAreaMetric())

			expect(result).toBeNull()
		})
	})
})
