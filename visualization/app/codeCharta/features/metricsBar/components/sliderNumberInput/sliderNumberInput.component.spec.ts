import { fireEvent, render, screen } from "@testing-library/angular"
import { SETTINGS_INPUT_DEBOUNCE_MS } from "../../util/settingsInput"
import { SliderNumberInputComponent } from "./sliderNumberInput.component"

describe("SliderNumberInputComponent", () => {
    afterEach(() => {
        jest.useRealTimers()
    })

    async function setup(options: { min?: number; max?: number; step?: number; value?: number; disabled?: boolean } = {}) {
        const { min = 0, max = 100, step = 1, value = 50, disabled = false } = options
        const renderResult = await render(SliderNumberInputComponent, {
            inputs: { min, max, step, value, disabled }
        })
        const valueChange = jest.fn()
        renderResult.fixture.componentInstance.valueChange.subscribe(valueChange)
        const numberInput = screen.getByRole("spinbutton") as HTMLInputElement
        const rangeInput = screen.getByRole("slider") as HTMLInputElement
        return { numberInput, rangeInput, valueChange }
    }

    it("should emit the latest value once after the debounce time elapses", async () => {
        // Arrange
        jest.useFakeTimers()
        const { numberInput, valueChange } = await setup()

        // Act
        fireEvent.input(numberInput, { target: { value: "10" } })
        fireEvent.input(numberInput, { target: { value: "25" } })
        jest.advanceTimersByTime(SETTINGS_INPUT_DEBOUNCE_MS)

        // Assert
        expect(valueChange).toHaveBeenCalledTimes(1)
        expect(valueChange).toHaveBeenCalledWith(25)
    })

    it("should not emit before the debounce time elapses", async () => {
        // Arrange
        jest.useFakeTimers()
        const { numberInput, valueChange } = await setup()

        // Act
        fireEvent.input(numberInput, { target: { value: "10" } })
        jest.advanceTimersByTime(SETTINGS_INPUT_DEBOUNCE_MS - 1)

        // Assert
        expect(valueChange).not.toHaveBeenCalled()
    })

    it("should clamp out-of-range values without overwriting the input while typing", async () => {
        // Arrange
        jest.useFakeTimers()
        const { numberInput, valueChange } = await setup({ min: 30, max: 100, value: 50 })

        // Act
        fireEvent.input(numberInput, { target: { value: "305" } })

        // Assert: the typed value survives so the user can keep editing
        expect(numberInput.value).toBe("305")

        jest.advanceTimersByTime(SETTINGS_INPUT_DEBOUNCE_MS)
        expect(valueChange).toHaveBeenCalledWith(100)
    })

    it("should allow typing a value whose intermediate digits are below the minimum", async () => {
        // Arrange
        jest.useFakeTimers()
        const { numberInput, valueChange } = await setup({ min: 30, max: 100, value: 30 })

        // Act: type "45" digit by digit; the intermediate "4" is below min
        fireEvent.input(numberInput, { target: { value: "4" } })
        expect(numberInput.value).toBe("4")
        fireEvent.input(numberInput, { target: { value: "45" } })
        jest.advanceTimersByTime(SETTINGS_INPUT_DEBOUNCE_MS)

        // Assert
        expect(valueChange).toHaveBeenCalledTimes(1)
        expect(valueChange).toHaveBeenCalledWith(45)
    })

    it("should round fractional input to the step", async () => {
        // Arrange
        jest.useFakeTimers()
        const { numberInput, valueChange } = await setup({ min: 0, max: 50, value: 1 })

        // Act
        fireEvent.input(numberInput, { target: { value: "2.7" } })
        jest.advanceTimersByTime(SETTINGS_INPUT_DEBOUNCE_MS)

        // Assert
        expect(valueChange).toHaveBeenCalledWith(3)
    })

    it("should restart the debounce window on every keystroke, including retyping the pending value", async () => {
        // Arrange
        jest.useFakeTimers()
        const { numberInput, valueChange } = await setup({ value: 50 })

        // Act: schedule 4, then retype the same 4 (select-all + same digit) shortly before the timer fires
        fireEvent.input(numberInput, { target: { value: "4" } })
        jest.advanceTimersByTime(300)
        fireEvent.input(numberInput, { target: { value: "4" } })
        jest.advanceTimersByTime(300)

        // Assert: still typing, so nothing committed yet
        expect(valueChange).not.toHaveBeenCalled()

        jest.advanceTimersByTime(100)
        expect(valueChange).toHaveBeenCalledTimes(1)
        expect(valueChange).toHaveBeenCalledWith(4)
    })

    it("should drop a pending intermediate value when typing returns to the committed value", async () => {
        // Arrange
        jest.useFakeTimers()
        const { numberInput, valueChange } = await setup({ value: 50 })

        // Act: retyping "50" passes through the intermediate "5"
        fireEvent.input(numberInput, { target: { value: "5" } })
        fireEvent.input(numberInput, { target: { value: "50" } })
        jest.advanceTimersByTime(SETTINGS_INPUT_DEBOUNCE_MS)

        // Assert
        expect(valueChange).not.toHaveBeenCalled()
    })

    it("should flush the pending value and normalize the display on change", async () => {
        // Arrange
        jest.useFakeTimers()
        const { numberInput, valueChange } = await setup({ min: 30, max: 100, value: 50 })

        // Act
        fireEvent.input(numberInput, { target: { value: "305" } })
        fireEvent.change(numberInput, { target: { value: "305" } })

        // Assert: committed immediately, field snapped to the effective value
        expect(valueChange).toHaveBeenCalledTimes(1)
        expect(valueChange).toHaveBeenCalledWith(100)
        expect(numberInput.value).toBe("100")

        jest.advanceTimersByTime(SETTINGS_INPUT_DEBOUNCE_MS)
        expect(valueChange).toHaveBeenCalledTimes(1)
    })

    it("should not emit for non-numeric input", async () => {
        // Arrange
        jest.useFakeTimers()
        const { numberInput, valueChange } = await setup()

        // Act
        fireEvent.input(numberInput, { target: { value: "" } })
        jest.advanceTimersByTime(SETTINGS_INPUT_DEBOUNCE_MS)

        // Assert
        expect(valueChange).not.toHaveBeenCalled()
    })

    it("should emit from the range slider as well", async () => {
        // Arrange
        jest.useFakeTimers()
        const { rangeInput, valueChange } = await setup()

        // Act
        fireEvent.input(rangeInput, { target: { value: "70" } })
        jest.advanceTimersByTime(SETTINGS_INPUT_DEBOUNCE_MS)

        // Assert
        expect(valueChange).toHaveBeenCalledWith(70)
    })
})
