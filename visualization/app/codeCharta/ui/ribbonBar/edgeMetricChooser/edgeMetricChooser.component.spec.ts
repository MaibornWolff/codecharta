import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { expect } from "@jest/globals"
import userEvent from "@testing-library/user-event"
import { toggleEdgeMetricVisible } from "../../../state/store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.actions"
import { setEdgeMetric } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { Store } from "../../../state/store/store"
import { EdgeMetricChooserComponent } from "./edgeMetricChooser.component"
import { EdgeMetricChooserModule } from "./edgeMetricChooser.module"

jest.mock("../../../state/selectors/accumulatedData/metricData/metricData.selector", () => ({
	metricDataSelector: () => ({
		edgeMetricData: [
			{ name: "aMetric", maxValue: 1 },
			{ name: "bMetric", maxValue: 2 }
		]
	})
}))

describe("edgeMetricChooserComponent", () => {
	beforeEach(() => {
		Store.dispatch(setEdgeMetric("aMetric"))
		TestBed.configureTestingModule({
			imports: [EdgeMetricChooserModule]
		})
	})

	it("should be a select for edge metric", async () => {
		await render(EdgeMetricChooserComponent, { excludeComponentDeclaration: true })

		await userEvent.click(await screen.findByText("aMetric (1)"))
		expect(screen.getByPlaceholderText("Edge Metric (highest value)")).not.toBe(null)
		const options = screen.queryAllByRole("option")
		expect(options[0].textContent).toMatch("aMetric (1)")
		expect(options[1].textContent).toMatch("bMetric (2)")

		await userEvent.click(options[1])
		expect(screen.queryByText("aMetric (1)")).toBe(null)
		expect(screen.queryByText("bMetric (2)")).not.toBe(null)
	})

	it("should reflect edge metric's visibility in its class name", async () => {
		const { container, detectChanges } = await render(EdgeMetricChooserComponent, { excludeComponentDeclaration: true })

		let metricChoser = container.querySelector("cc-metric-chooser")
		expect(metricChoser.classList.contains("is-edge-metric-disabled")).toBe(false)

		Store.dispatch(toggleEdgeMetricVisible())
		detectChanges()
		metricChoser = container.querySelector("cc-metric-chooser")
		expect(metricChoser.classList.contains("is-edge-metric-disabled")).toBe(true)
	})
})
