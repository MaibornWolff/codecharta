import { fireEvent, render, screen } from "@testing-library/angular"
import { MetricColorRangeSliderComponent } from "./metricColorRangeSlider.component"

describe("MetricColorRangeSliderComponent", () => {
    async function setup(overrides: Partial<MetricColorRangeSliderComponent> = {}) {
        const handleValueChange = jest.fn()
        const renderResult = await render(MetricColorRangeSliderComponent, {
            inputs: {
                minValue: 0,
                maxValue: 100,
                currentLeftValue: 30,
                currentRightValue: 70,
                leftColor: "#ff0000",
                middleColor: "#ffff00",
                rightColor: "#00ff00",
                handleValueChange,
                ...overrides
            }
        })
        const leftThumb = screen.getByLabelText("Lower color range value") as HTMLInputElement
        const rightThumb = screen.getByLabelText("Upper color range value") as HTMLInputElement
        return { ...renderResult, handleValueChange, leftThumb, rightThumb }
    }

    it("should expose current/min/max via the native range inputs on both thumbs", async () => {
        // Arrange & Act
        const { leftThumb, rightThumb } = await setup()

        // Assert
        expect(leftThumb.min).toBe("0")
        expect(leftThumb.max).toBe("70")
        expect(leftThumb.value).toBe("30")
        expect(rightThumb.min).toBe("30")
        expect(rightThumb.max).toBe("100")
        expect(rightThumb.value).toBe("70")
    })

    it("should decrement the left value by 1 on ArrowLeft", async () => {
        // Arrange
        const { leftThumb, handleValueChange } = await setup()

        // Act
        fireEvent.keyDown(leftThumb, { key: "ArrowLeft" })

        // Assert
        expect(handleValueChange).toHaveBeenCalledWith({ newLeftValue: 29 })
    })

    it("should increment the right value by 1 on ArrowUp", async () => {
        // Arrange
        const { rightThumb, handleValueChange } = await setup()

        // Act
        fireEvent.keyDown(rightThumb, { key: "ArrowUp" })

        // Assert
        expect(handleValueChange).toHaveBeenCalledWith({ newRightValue: 71 })
    })

    it("should jump the left value to its lower bound on Home and to its upper bound on End", async () => {
        // Arrange
        const { leftThumb, handleValueChange } = await setup()

        // Act
        fireEvent.keyDown(leftThumb, { key: "Home" })
        fireEvent.keyDown(leftThumb, { key: "End" })

        // Assert
        expect(handleValueChange).toHaveBeenNthCalledWith(1, { newLeftValue: 0 })
        expect(handleValueChange).toHaveBeenNthCalledWith(2, { newLeftValue: 70 })
    })

    it("should clamp the left value at its upper bound so it never crosses the right thumb", async () => {
        // Arrange: left already touches the right value
        const { leftThumb, handleValueChange } = await setup({ currentLeftValue: 70, currentRightValue: 70 })

        // Act
        fireEvent.keyDown(leftThumb, { key: "ArrowRight" })

        // Assert: clamped to 70 equals the current value, so no change is emitted
        expect(handleValueChange).not.toHaveBeenCalled()
    })

    it("should clamp the right value at its lower bound so it never crosses the left thumb", async () => {
        // Arrange: right already touches the left value
        const { rightThumb, handleValueChange } = await setup({ currentLeftValue: 30, currentRightValue: 30 })

        // Act
        fireEvent.keyDown(rightThumb, { key: "ArrowDown" })

        // Assert: clamped to 30 equals the current value, so no change is emitted
        expect(handleValueChange).not.toHaveBeenCalled()
    })

    it("should ignore unrelated keys without emitting a value change", async () => {
        // Arrange
        const { leftThumb, handleValueChange } = await setup()

        // Act
        fireEvent.keyDown(leftThumb, { key: "Enter" })

        // Assert
        expect(handleValueChange).not.toHaveBeenCalled()
    })

    it("should reject NaN input on the left number field", async () => {
        // Arrange
        const { fixture, handleValueChange } = await setup()
        const leftInput = fixture.nativeElement.querySelectorAll("input[type=number]")[0] as HTMLInputElement

        // Act
        leftInput.value = "not-a-number"
        fireEvent.input(leftInput)

        // Assert
        expect(handleValueChange).not.toHaveBeenCalled()
    })

    it("should emit a clamped value when a valid left number is entered", async () => {
        // Arrange
        const { fixture, handleValueChange } = await setup()
        const leftInput = fixture.nativeElement.querySelectorAll("input[type=number]")[0] as HTMLInputElement

        // Act
        leftInput.value = "45"
        fireEvent.input(leftInput)

        // Assert
        expect(handleValueChange).toHaveBeenCalledWith({ newLeftValue: 45 })
    })
})
