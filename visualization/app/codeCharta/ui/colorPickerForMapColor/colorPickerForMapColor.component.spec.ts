import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { ColorPickerForMapColorComponent } from "./colorPickerForMapColor.component"

import { ColorPickerForMapColorModule } from "./colorPickerForMapColor.module"
import { mapColorsSelector } from "../../state/store/appSettings/mapColors/mapColors.selector"
import { defaultMapColors } from "../../state/store/appSettings/mapColors/mapColors.reducer"
import { colorRangeSelector } from "../../state/store/dynamicSettings/colorRange/colorRange.selector"
import { selectedColorMetricDataSelector } from "../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"

describe("colorPickerForMapColor", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ColorPickerForMapColorModule],
			providers: [
				provideMockStore({
					selectors: [
						{ selector: mapColorsSelector, value: defaultMapColors },
						{ selector: colorRangeSelector, value: { from: 21, to: 100 } },
						{ selector: selectedColorMetricDataSelector, value: { minValue: 0, maxValue: 100 } }
					]
				})
			]
		})
	})

	it("should render correctly", async () => {
		await render(ColorPickerForMapColorComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { mapColorFor: "positive" }
		})

		const renderedLabel = screen.queryByText("0 to 20")
		expect(renderedLabel).not.toBe(null)
	})
})
