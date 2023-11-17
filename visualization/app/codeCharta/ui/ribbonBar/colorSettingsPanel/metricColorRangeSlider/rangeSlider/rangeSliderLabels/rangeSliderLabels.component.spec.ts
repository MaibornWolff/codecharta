import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { RangeSliderModule } from "../rangeSlider.module"
import { RangeSliderLabelsComponent } from "./rangeSliderLabels.component"

describe("RangeSliderLabelsComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RangeSliderModule]
		})
	})

	const renderWithMocks = async (leftValue: number, rightValue: number) => {
		const componentProperties = {
			minValue: 0,
			maxValue: 100,
			leftValueLabel: leftValue,
			rightValueLabel: rightValue,
			sliderWidth: 100,
			sliderRangePosition: { leftEnd: leftValue, rightStart: rightValue }
		}
		const { fixture, rerender } = await render(RangeSliderLabelsComponent, {
			excludeComponentDeclaration: true,
			componentProperties
		})

		// just assume each label has a width of 10, so we can check that the labels are displayed correctly
		for (const label of ["minLabel", "maxLabel", "currentLeftLabel", "currentRightLabel", "combinedCurrentLeftRightLabel"]) {
			fixture.componentInstance[label].nativeElement.getBoundingClientRect = () => ({ width: 10 })
		}
		fixture.componentInstance.ngAfterViewChecked()
		await rerender({ componentProperties })
	}

	it("should display labels for min, currentLeft, currentRight and max value", async () => {
		await renderWithMocks(20, 70)

		expect(screen.queryByText("0").style.visibility).toBe("visible")
		expect(screen.queryByText("20").style.visibility).toBe("visible")
		expect(screen.queryByText("70").style.visibility).toBe("visible")
		expect(screen.queryByText("100").style.visibility).toBe("visible")
		expect(screen.queryByText("20 - 70").style.visibility).toBe("hidden")
	})

	it("should display combined label for left and right value when they would overlap", async () => {
		await renderWithMocks(50, 51)

		expect(screen.queryByText("50").style.visibility).toBe("hidden")
		expect(screen.queryByText("51").style.visibility).toBe("hidden")
		expect(screen.queryByText("50 - 51").style.visibility).toBe("visible")
	})

	it("should hide min label when it would overlap with left label", async () => {
		await renderWithMocks(1, 51)

		expect(screen.queryByText("0").style.visibility).toBe("hidden")
	})

	it("should hide max label when it would overlap with right label", async () => {
		await renderWithMocks(50, 99)

		expect(screen.queryByText("100").style.visibility).toBe("hidden")
	})
})
