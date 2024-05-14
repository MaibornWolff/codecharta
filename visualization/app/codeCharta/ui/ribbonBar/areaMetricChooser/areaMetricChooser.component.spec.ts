import { TestBed } from "@angular/core/testing"
import { expect } from "@jest/globals"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { hoveredNodeSelector } from "../../../state/selectors/hoveredNode.selector"
import { setAreaMetric } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { NodeSelectionService } from "../../metricChooser/nodeSelection.service"
import { AreaMetricChooserComponent } from "./areaMetricChooser.component"
import { AreaMetricChooserModule } from "./areaMetricChooser.module"

describe("areaMetricChooserComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [AreaMetricChooserModule],
			providers: [
				{ provide: NodeSelectionService, useValue: { createNodeObservable: jest.fn() } },
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
						{ selector: hoveredNodeSelector, value: null },
						{ selector: attributeDescriptorsSelector, value: {} }
					]
				})
			]
		})
	})

	it("should be a select for area metric", async () => {
		const { detectChanges } = await render(AreaMetricChooserComponent, { excludeComponentDeclaration: true })

		await userEvent.click(await screen.findByText("aMetric"))
		await waitFor(() => expect(screen.getByPlaceholderText("Area Metric (highest value)")).not.toBe(null))
		const options = screen.queryAllByRole("option")
		expect(options[0].textContent).toMatch("aMetric (1)")
		expect(options[1].textContent).toMatch("bMetric (2)")

		await userEvent.click(options[1])

		const store = TestBed.inject(MockStore)
		expect(await getLastAction(store)).toEqual(setAreaMetric({ value: "bMetric" }))
		store.overrideSelector(areaMetricSelector, "bMetric")
		store.refreshState()
		detectChanges()

		await waitFor(() => expect(screen.queryByText("aMetric")).toBe(null))
		await waitFor(() => expect(screen.queryByText("bMetric")).not.toBe(null))
	})
})
