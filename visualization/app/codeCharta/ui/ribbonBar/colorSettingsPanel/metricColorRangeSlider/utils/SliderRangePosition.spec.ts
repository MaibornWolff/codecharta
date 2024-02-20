import { calculateSliderRangePosition, thumbPosition2Value, updateLeftThumb, updateRightThumb } from "./SliderRangePosition"

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

	it("should put thumbs at right end, when min value is equal to max value", () => {
		expect(
			calculateSliderRangePosition({
				minValue: 0,
				maxValue: 0,
				currentLeftValue: 0,
				currentRightValue: 0,
				sliderWidth: 100
			})
		).toEqual({
			leftEnd: 100,
			rightStart: 100
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

	describe("updateLeftThumb", () => {
		it("should calculate correct values", () => {
			expect(
				updateLeftThumb({
					deltaX: 10,
					thumbScreenX: 83,
					thumbRadius: 7,
					otherThumbScreenX: 100,
					sliderBoundingClientRectX: 10,
					sliderWidth: 100,
					minValue: 0,
					maxValue: 100
				})
			).toEqual({
				updatedThumbX: 90,
				upcomingValue: 90
			})
		})

		it("should set updates smaller than min value to min value", () => {
			expect(
				updateLeftThumb({
					deltaX: -81,
					thumbScreenX: 83,
					thumbRadius: 7,
					otherThumbScreenX: 100,
					sliderBoundingClientRectX: 10,
					sliderWidth: 100,
					minValue: 0,
					maxValue: 100
				})
			).toEqual({
				updatedThumbX: 0,
				upcomingValue: 0
			})
		})

		it("should set updates over right thumb to right thumb", () => {
			expect(
				updateLeftThumb({
					deltaX: 10,
					thumbScreenX: 83,
					thumbRadius: 7,
					otherThumbScreenX: 90,
					sliderBoundingClientRectX: 10,
					sliderWidth: 100,
					minValue: 0,
					maxValue: 100
				})
			).toEqual({
				updatedThumbX: 87,
				upcomingValue: 87
			})
		})
	})

	describe("updateRightThumb", () => {
		it("should set updates bigger than max value to max value", () => {
			expect(
				updateRightThumb({
					deltaX: 40,
					thumbScreenX: 83,
					thumbRadius: 7,
					otherThumbScreenX: 20,
					sliderBoundingClientRectX: 10,
					sliderWidth: 100,
					minValue: 0,
					maxValue: 100
				})
			).toEqual({
				updatedThumbX: 100,
				upcomingValue: 100
			})
		})

		it("should set updates over left thumb to left thumb", () => {
			expect(
				updateRightThumb({
					deltaX: -70,
					thumbScreenX: 83,
					thumbRadius: 7,
					otherThumbScreenX: 15,
					sliderBoundingClientRectX: 10,
					sliderWidth: 100,
					minValue: 0,
					maxValue: 100
				})
			).toEqual({
				updatedThumbX: 12,
				upcomingValue: 12
			})
		})
	})
})