import { DEFAULT_STATE } from "../../../util/dataMocks"
import metricData from "./metricData.reducer"
import { MetricDataAction } from "./metricData.actions"

describe("metricData", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = metricData(undefined, {} as MetricDataAction)

			expect(result).toEqual(DEFAULT_STATE.metricData)
		})
	})
})
