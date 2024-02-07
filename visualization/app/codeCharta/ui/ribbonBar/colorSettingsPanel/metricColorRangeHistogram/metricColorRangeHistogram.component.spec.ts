import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { setColorRange } from "../../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { wait } from "../../../../util/testUtils/wait"
import { MetricColorRangeHistogramComponent } from "./metricColorRangeHistogram.component"
import { MetricColorRangeHistogramModule } from "./metricColorRangeHistogram.module"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { metricColorRangeHistogramValuesSelector } from "./selectors/metricColorRangeHistogramValues.selector"
import { metricColorRangeHistogramColorsSelector } from "./selectors/metricColorRangeHistogramColors.selector"
import { getLastAction } from "../../../../util/testUtils/store.utils"

describe("MetricColorRangeHistogramComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MetricColorRangeHistogramModule],
			providers: [
				provideMockStore({
					selectors: [
						{ selector: metricColorRangeHistogramValuesSelector, value: { min: 0, max: 100, from: 0, to: 100 } },
						{
							selector: metricColorRangeHistogramColorsSelector,
							value: { leftColor: "red", middleColor: "orange", rightColor: "green" }
						}
					]
				})
			]
		})
	})

	it("should update store debounced without loosing an update and track it", async () => {
		const { fixture } = await render(MetricColorRangeHistogramComponent, { excludeComponentDeclaration: true })
		fixture.componentInstance.handleValueChange({ newLeftValue: 10 })
		fixture.componentInstance.handleValueChange({ newRightValue: 20 })
		const store = TestBed.inject(MockStore)
		expect(await getLastAction(store)).toEqual({ type: "@ngrx/store/init" })

		await wait(400)
		expect(await getLastAction(store)).toEqual(setColorRange({ value: { from: 10, to: 20 } }))
	})
})
