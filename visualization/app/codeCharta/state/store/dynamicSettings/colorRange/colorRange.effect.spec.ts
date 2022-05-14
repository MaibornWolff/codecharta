import { _nodeMetricRangeToInitialColorRange } from "./resetColorRange.effect"

describe("ColorRangeEffect", () => {
	it("should split positive, neutral, negative to a third each", () => {
		expect(_nodeMetricRangeToInitialColorRange({ minValue: 20, maxValue: 120 })).toEqual({ from: 53, to: 86 })
	})
})
