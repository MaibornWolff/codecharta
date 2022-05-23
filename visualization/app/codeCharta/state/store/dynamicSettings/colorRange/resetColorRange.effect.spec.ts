import { _metricMinMaxToInitialColorRange } from "./resetColorRange.effect"

describe("ResetColorRangeColorRangeEffect", () => {
	it("should split positive, neutral, negative to a third each", () => {
		expect(_metricMinMaxToInitialColorRange({ minValue: 20, maxValue: 120 })).toEqual({ from: 53, to: 86 })
	})
})
