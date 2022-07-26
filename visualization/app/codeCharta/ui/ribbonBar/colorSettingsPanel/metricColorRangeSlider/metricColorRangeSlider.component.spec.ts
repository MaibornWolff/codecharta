import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { setColorRange } from "../../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { Store } from "../../../../state/store/store"
import { wait } from "../../../../util/testUtils/wait"
import { MetricColorRangeSliderComponent } from "./metricColorRangeSlider.component"
import { MetricColorRangeSliderModule } from "./metricColorRangeSlider.module"

describe("MetricColorRangeSliderComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MetricColorRangeSliderModule]
		})
	})

	it("should update store debounced without loosing an update and track it", async () => {
		const storeSpy = jest.spyOn(Store.store, "dispatch")
		const { fixture } = await render(MetricColorRangeSliderComponent, { excludeComponentDeclaration: true })
		fixture.componentInstance.handleValueChange({ newLeftValue: 10 })
		fixture.componentInstance.handleValueChange({ newRightValue: 20 })
		expect(storeSpy).toHaveBeenCalledTimes(0)

		await wait(400)
		expect(storeSpy).toHaveBeenCalledTimes(1)
		expect(storeSpy).toHaveBeenCalledWith(setColorRange({ from: 10, to: 20 }))
	})
})
