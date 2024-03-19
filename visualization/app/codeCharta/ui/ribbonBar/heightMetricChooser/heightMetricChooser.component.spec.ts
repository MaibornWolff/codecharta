import { TestBed } from "@angular/core/testing"
import { expect } from "@jest/globals"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { hoveredNodeSelector } from "../../../state/selectors/hoveredNode.selector"
import { setHeightMetric } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { heightMetricSelector } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { NodeSelectionService } from "../../metricChooser/nodeSelection.service"
import { HeightMetricChooserComponent } from "./heightMetricChooser.component"
import { HeightMetricChooserModule } from "./heightMetricChooser.module"

describe("heightMetricChooserComponent", () => {
	let store: MockStore

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HeightMetricChooserModule],
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
						{ selector: heightMetricSelector, value: "aMetric" },
						{ selector: hoveredNodeSelector, value: null },
						{ selector: attributeDescriptorsSelector, value: {} }
					]
				})
			]
		})
	})

	it("should be a select for height metric", async () => {
		const { detectChanges } = await render(HeightMetricChooserComponent, { excludeComponentDeclaration: true })
		store = TestBed.inject(MockStore)

		await userEvent.click(await screen.findByText("aMetric"))
		expect(screen.getByPlaceholderText("Height Metric (highest value)")).not.toBe(null)

		const options = screen.queryAllByRole("option")
		expect(options[0].textContent).toMatch("aMetric (1)")
		expect(options[1].textContent).toMatch("bMetric (2)")
		await userEvent.click(options[1])

		expect(await getLastAction(store)).toEqual(setHeightMetric({ value: "bMetric" }))
		store.overrideSelector(heightMetricSelector, "bMetric")
		store.refreshState()
		detectChanges()

		expect(screen.queryByText("aMetric")).toBe(null)
		expect(screen.queryByText("bMetric")).not.toBe(null)
	})
})
