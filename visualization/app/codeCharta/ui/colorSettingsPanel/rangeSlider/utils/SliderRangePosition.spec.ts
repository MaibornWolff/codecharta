import { calculateSliderRangePosition } from "./SliderRangePosition"

describe("SliderRangePosition", () => {
	it("should calculate correct values", () => {
		expect(
			calculateSliderRangePosition({
				minValue: 20,
				maxValue: 120,
				currentLeftValue: 40,
				currentRightValue: 80,
				sliderWidth: 100
			})
		).toEqual({
			leftEnd: 20,
			rightStart: 60
		})
	})
})
