import { calculateInitialColorRange } from "./calculateInitialColorRange"

describe("calculateInitialColorRange", () => {
	it("should split positive, neutral, negative to a third each", () => {
		expect(calculateInitialColorRange({ minValue: 20, maxValue: 120 })).toEqual({ from: 53, to: 86 })
	})
})
