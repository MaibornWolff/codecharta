import { calculateSliderRangePosition, thumbPosition2Value } from "./SliderRangePosition"

describe("SliderRangePosition", () => {
	it("should calculate correct slider positions", () => {
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

	it("should calculate min value when thumbX is at beginning of slider", () => {
		expect(
			thumbPosition2Value({
				thumbX: 0,
				minValue: 20,
				maxValue: 120,
				sliderWidth: 100
			})
		).toBe(20)
	})

	it("should calculate max value when thumbX is at end of slider", () => {
		expect(
			thumbPosition2Value({
				thumbX: 100,
				minValue: 20,
				maxValue: 120,
				sliderWidth: 100
			})
		).toBe(120)
	})

	it("should calculate middle value when thumbX is at middle of slider", () => {
		expect(
			thumbPosition2Value({
				thumbX: 50,
				minValue: 20,
				maxValue: 120,
				sliderWidth: 100
			})
		).toBe(70)
	})
})
