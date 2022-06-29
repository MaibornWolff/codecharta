import { TestBed } from "@angular/core/testing"
import { fireEvent, render } from "@testing-library/angular"
import { RangeSliderComponent } from "./rangeSlider.component"
import { RangeSliderModule } from "./rangeSlider.module"

describe("RangeSliderComponent", () => {
	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [RangeSliderModule]
		})
	})

	const renderComponent = async (handleValueChange = jest.fn()) => {
		return render(RangeSliderComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				minValue: 0,
				maxValue: 100,
				currentLeftValue: 20,
				currentRightValue: 70,
				sliderWidth: 100,
				leftColor: "green",
				middleColor: "orange",
				rightColor: "red",
				handleValueChange
			}
		})
	}

	it("should display bars correctly", async () => {
		const { container } = await renderComponent()
		const bars = container.querySelectorAll(".cc-range-slider-bar") as NodeListOf<HTMLSpanElement>
		expect(bars[0].style.width).toBe("20px")
		expect(bars[0].style.borderBottomColor).toBe("green")
		expect(bars[1].style.width).toBe("50px")
		expect(bars[1].style.borderBottomColor).toBe("orange")
		expect(bars[2].style.width).toBe("30px")
		expect(bars[2].style.borderBottomColor).toBe("red")
	})

	it("should prevent left value input from submitting values lower than min value", async () => {
		const handleValueChange = jest.fn()
		const { container } = await renderComponent(handleValueChange)
		const leftInput = container.querySelectorAll("input")[0]
		fireEvent.input(leftInput, { target: { value: "-10" } })
		expect(handleValueChange).toHaveBeenCalledWith({ newLeftValue: 0 })
	})

	it("should prevent left value input from submitting values bigger than right value", async () => {
		const handleValueChange = jest.fn()
		const { container } = await renderComponent(handleValueChange)
		const leftInput = container.querySelectorAll("input")[0]
		fireEvent.input(leftInput, { target: { value: "75" } })
		expect(handleValueChange).toHaveBeenCalledWith({ newLeftValue: 70 })
	})

	it("should prevent right value input from submitting values lower than left value", async () => {
		const handleValueChange = jest.fn()
		const { container } = await renderComponent(handleValueChange)
		const rightInput = container.querySelectorAll("input")[1]
		fireEvent.input(rightInput, { target: { value: "10" } })
		expect(handleValueChange).toHaveBeenCalledWith({ newRightValue: 20 })
	})

	it("should prevent right value input from submitting values bigger than max value", async () => {
		const handleValueChange = jest.fn()
		const { container } = await renderComponent(handleValueChange)
		const rightInput = container.querySelectorAll("input")[1]
		fireEvent.input(rightInput, { target: { value: "101" } })
		expect(handleValueChange).toHaveBeenCalledWith({ newRightValue: 100 })
	})

	it("should enable sliding of left thumb on mouse down and disabling it again on mouse up", async () => {
		const { container, fixture } = await renderComponent()
		fixture.componentInstance.handleLeftThumbMoved = jest.fn()
		const leftThumb = container.querySelectorAll(".cc-range-slider-slider-thumb")[0] as HTMLDivElement

		fireEvent.mouseDown(leftThumb)
		fireEvent.mouseMove(document)
		expect(fixture.componentInstance.handleLeftThumbMoved).toHaveBeenCalledTimes(1)

		fireEvent.mouseUp(document)
		fireEvent.mouseMove(document)
		expect(fixture.componentInstance.handleLeftThumbMoved).toHaveBeenCalledTimes(1)
	})

	it("should enable sliding of right thumb on mouse down and disabling it again on mouse up", async () => {
		const { container, fixture } = await renderComponent()
		fixture.componentInstance.handleRightThumbMoved = jest.fn()
		const rightThumb = container.querySelectorAll(".cc-range-slider-slider-thumb")[1] as HTMLDivElement

		fireEvent.mouseDown(rightThumb)
		fireEvent.mouseMove(document)
		expect(fixture.componentInstance.handleRightThumbMoved).toHaveBeenCalledTimes(1)

		fireEvent.mouseUp(document)
		fireEvent.mouseMove(document)
		expect(fixture.componentInstance.handleRightThumbMoved).toHaveBeenCalledTimes(1)
	})

	it("should put last moved thumb on top, so an user can drag it again in case of overlapping thumbs", async () => {
		const { container, fixture } = await renderComponent()
		fixture.componentInstance.handleRightThumbMoved = jest.fn()
		const leftThumb = container.querySelectorAll(".cc-range-slider-slider-thumb")[0] as HTMLDivElement
		const rightThumb = container.querySelectorAll(".cc-range-slider-slider-thumb")[1] as HTMLDivElement

		fireEvent.mouseDown(leftThumb)
		fireEvent.mouseUp(leftThumb)
		expect(leftThumb.style.zIndex).toBe("1")
		expect(rightThumb.style.zIndex).toBe("0")

		fireEvent.mouseDown(rightThumb)
		fireEvent.mouseUp(rightThumb)
		expect(leftThumb.style.zIndex).toBe("0")
		expect(rightThumb.style.zIndex).toBe("1")
	})
})
