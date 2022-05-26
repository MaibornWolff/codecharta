import { TestBed } from "@angular/core/testing"
import { render, screen, waitForElementToBeRemoved } from "@testing-library/angular"
import { waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import { MetricChooserComponent } from "./metricChooser.component"
import { MetricChooserModule } from "./metricChooser.module"

jest.mock("../../state/selectors/accumulatedData/metricData/nodeMetricData.selector", () => ({
	nodeMetricDataSelector: () => [
		{ name: "aMetric", maxValue: 1 },
		{ name: "bMetric", maxValue: 2 },
		{ name: "cMetric", maxValue: 3 }
	]
}))

describe("metricChooserComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MetricChooserModule]
		})
	})

	it("should be a select for metrics", async () => {
		let selectedMetricName = "aMetric"
		await render(MetricChooserComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				searchPlaceholder: "search metric (max value)",
				selectedMetricName,
				handleMetricChanged: (value: string) => (selectedMetricName = value)
			}
		})

		userEvent.click(await screen.findByText("aMetric (1)"))
		const options = screen.queryAllByRole("option")
		expect(options[0].textContent).toMatch("aMetric (1)")
		expect(options[1].textContent).toMatch("bMetric (2)")
		expect(options[2].textContent).toMatch("cMetric (3)")

		userEvent.click(options[1])
		await waitForElementToBeRemoved(options[2])
		expect(screen.queryByText("aMetric (1)")).toBe(null)
		expect(screen.queryByText("bMetric (2)")).not.toBe(null)
	})

	it("should focus search field initially, filter options by search term, and reset search term on close", async () => {
		await render(MetricChooserComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				searchPlaceholder: "search metric (max value)",
				selectedMetricName: "aMetric",
				handleMetricChanged: jest.fn()
			}
		})

		userEvent.click(await screen.findByText("aMetric (1)"))
		await screen.findByText("search metric (max value)")
		userEvent.type(getSearchBox(), "b")

		const options = await screen.queryAllByRole("option")
		expect(options.length).toBe(1)
		expect(options[0].textContent).toMatch("bMetric (2)")

		userEvent.click(options[0])
		await waitFor(() => getSearchBox().value === "")

		function getSearchBox() {
			const selectContainer = screen.getByRole("listbox")
			return selectContainer.querySelector("input")
		}
	})
})
