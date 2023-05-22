import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { expect } from "@jest/globals"
import userEvent from "@testing-library/user-event"
import { EdgeMetricChooserComponent } from "./edgeMetricChooser.component"
import { EdgeMetricChooserModule } from "./edgeMetricChooser.module"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { edgeMetricSelector } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { isEdgeMetricVisibleSelector } from "../../../state/store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.selector"
import { hoveredEdgeValueSelector } from "./hoveredEdgeValue.selector"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { setEdgeMetric } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.actions"

describe("edgeMetricChooserComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [EdgeMetricChooserModule],
			providers: [
				provideMockStore({
					selectors: [
						{
							selector: metricDataSelector,
							value: {
								edgeMetricData: [
									{ name: "aMetric", maxValue: 1 },
									{ name: "bMetric", maxValue: 2 }
								]
							}
						},
						{ selector: edgeMetricSelector, value: "aMetric" },
						{ selector: hoveredEdgeValueSelector, value: null },
						{ selector: isEdgeMetricVisibleSelector, value: true },
						{ selector: attributeDescriptorsSelector, value: {} }
					]
				})
			]
		})
	})

	it("should be a select for edge metric", async () => {
		const { detectChanges } = await render(EdgeMetricChooserComponent, { excludeComponentDeclaration: true })

		await userEvent.click(await screen.findByText("aMetric"))
		expect(screen.getByPlaceholderText("Edge Metric (highest value)")).not.toBe(null)
		const options = screen.queryAllByRole("option")
		expect(options[0].textContent).toMatch("aMetric (1)")
		expect(options[1].textContent).toMatch("bMetric (2)")

		const store = TestBed.inject(MockStore)
		await userEvent.click(options[1])
		expect(await getLastAction(store)).toEqual(setEdgeMetric({ value: "bMetric" }))
		store.overrideSelector(edgeMetricSelector, "bMetric")
		store.refreshState()
		detectChanges()

		expect(screen.queryByText("aMetric")).toBe(null)
		expect(screen.queryByText("bMetric")).not.toBe(null)
	})

	it("should reflect edge metric's visibility in its class name", async () => {
		const { container, detectChanges } = await render(EdgeMetricChooserComponent, { excludeComponentDeclaration: true })

		let metricChoser = container.querySelector("cc-metric-chooser")
		expect(metricChoser.classList.contains("is-edge-metric-disabled")).toBe(false)
		const store = TestBed.inject(MockStore)
		store.overrideSelector(isEdgeMetricVisibleSelector, false)
		store.refreshState()
		detectChanges()

		metricChoser = container.querySelector("cc-metric-chooser")
		expect(metricChoser.classList.contains("is-edge-metric-disabled")).toBe(true)
	})
})
