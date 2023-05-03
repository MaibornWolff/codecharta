import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { setColorRange } from "../../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { wait } from "../../../../util/testUtils/wait"
import { MetricColorRangeSliderComponent } from "./metricColorRangeSlider.component"
import { MetricColorRangeSliderModule } from "./metricColorRangeSlider.module"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { metricColorRangeSliderValuesSelector } from "./selectors/metricColorRangeSliderValues.selector"
import { metricColorRangeSliderColorsSelector } from "./selectors/metricColorRangeSliderColors.selector"
import { getLastAction } from "../../../../util/testUtils/store.utils"

describe("MetricColorRangeSliderComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MetricColorRangeSliderModule],
			providers: [
				provideMockStore({
					selectors: [
						{ selector: metricColorRangeSliderValuesSelector, value: { min: 0, max: 100, from: 0, to: 100 } },
						{
							selector: metricColorRangeSliderColorsSelector,
							value: { leftColor: "red", middleColor: "orange", rightColor: "green" }
						}
					]
				})
			]
		})
	})

	it("should update store debounced without loosing an update and track it", async () => {
		const { fixture } = await render(MetricColorRangeSliderComponent, { excludeComponentDeclaration: true })
		fixture.componentInstance.handleValueChange({ newLeftValue: 10 })
		fixture.componentInstance.handleValueChange({ newRightValue: 20 })
		const store = TestBed.inject(MockStore)
		expect(await getLastAction(store)).toEqual({ type: "@ngrx/store/init" })

		await wait(400)
		expect(await getLastAction(store)).toEqual(setColorRange({ value: { from: 10, to: 20 } }))
	})
})
