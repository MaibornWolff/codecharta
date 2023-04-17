import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { expect } from "@jest/globals"
import userEvent from "@testing-library/user-event"
import { AreaMetricChooserComponent } from "./areaMetricChooser.component"
import { AreaMetricChooserModule } from "./areaMetricChooser.module"
import { provideMockStore } from "@ngrx/store/testing"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { hoveredNodeSelector } from "../../../state/selectors/hoveredNode.selector"

describe("areaMetricChooserComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [AreaMetricChooserModule],
			providers: [
				provideMockStore({
					selectors: [
						{
							selector: metricDataSelector,
							value: {
								nodeMetricData: [
									{ name: "aMetric", maxValue: 1 },
									{ name: "bMetric", maxValue: 2 }
								]
							}
						},
						{ selector: areaMetricSelector, value: "aMetric" },
						{ selector: hoveredNodeSelector, value: null }
					]
				})
			]
		})
	})

	it("should be a select for area metric", async () => {
		await render(AreaMetricChooserComponent, { excludeComponentDeclaration: true })

		await userEvent.click(await screen.findByText("aMetric (1)"))
		expect(screen.getByPlaceholderText("Area Metric (highest value)")).not.toBe(null)
		const options = screen.queryAllByRole("option")
		expect(options[0].textContent).toMatch("aMetric (1)")
		expect(options[1].textContent).toMatch("bMetric (2)")

		await userEvent.click(options[1])
		expect(screen.queryByText("aMetric (1)")).toBe(null)
		expect(screen.queryByText("bMetric (2)")).not.toBe(null)
	})
})
