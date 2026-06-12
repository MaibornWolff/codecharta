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

    it("should clamp positions to the slider width when current values exceed the metric maximum", () => {
        // Arrange: stale color range (e.g. after a metric switch) far above the new maximum
        const argument = {
            minValue: 0,
            maxValue: 10,
            currentLeftValue: 50,
            currentRightValue: 80,
            sliderWidth: 100
        }

        // Act
        const position = calculateSliderRangePosition(argument)

        // Assert
        expect(position).toEqual({ leftEnd: 100, rightStart: 100 })
    })

    it("should clamp positions to zero when current values fall below the metric minimum", () => {
        // Arrange
        const argument = {
            minValue: 20,
            maxValue: 120,
            currentLeftValue: 0,
            currentRightValue: 10,
            sliderWidth: 100
        }

        // Act
        const position = calculateSliderRangePosition(argument)

        // Assert
        expect(position).toEqual({ leftEnd: 0, rightStart: 0 })
    })

    it("should keep rightStart at least at leftEnd when current values are crossed", () => {
        // Arrange
        const argument = {
            minValue: 0,
            maxValue: 100,
            currentLeftValue: 80,
            currentRightValue: 20,
            sliderWidth: 100
        }

        // Act
        const position = calculateSliderRangePosition(argument)

        // Assert
        expect(position).toEqual({ leftEnd: 80, rightStart: 80 })
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
                    otherThumbX: 97,
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
                    otherThumbX: 97,
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
                    otherThumbX: 87,
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

        it("should pin the left thumb exactly to the right thumb position when screen rects disagree by subpixels", () => {
            // Arrange: fractional rects as reported on scaled/zoomed displays
            const argument = {
                deltaX: 30,
                thumbScreenX: 70.4,
                thumbRadius: 7,
                otherThumbX: 60.25,
                sliderBoundingClientRectX: 10.3,
                sliderWidth: 100,
                minValue: 0,
                maxValue: 100
            }

            // Act
            const update = updateLeftThumb(argument)

            // Assert: never lands above the right thumb's logical position
            expect(update.updatedThumbX).toBe(60.25)
        })
    })

    describe("updateRightThumb", () => {
        it("should set updates bigger than max value to max value", () => {
            expect(
                updateRightThumb({
                    deltaX: 40,
                    thumbScreenX: 83,
                    thumbRadius: 7,
                    otherThumbX: 17,
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
                    otherThumbX: 12,
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

        it("should pin the right thumb exactly to the left thumb position when screen rects disagree by subpixels", () => {
            // Arrange: fractional rects as reported on scaled/zoomed displays
            const argument = {
                deltaX: -30,
                thumbScreenX: 90.4,
                thumbRadius: 7,
                otherThumbX: 60.25,
                sliderBoundingClientRectX: 10.3,
                sliderWidth: 100,
                minValue: 0,
                maxValue: 100
            }

            // Act
            const update = updateRightThumb(argument)

            // Assert: never lands below the left thumb's logical position
            expect(update.updatedThumbX).toBe(60.25)
        })
    })
})
