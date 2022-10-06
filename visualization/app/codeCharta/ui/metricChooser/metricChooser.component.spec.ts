import { Component } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
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

		await userEvent.click(await screen.findByText("aMetric (1)"))
		const options = screen.queryAllByRole("option")
		expect(options[0].textContent).toMatch("aMetric (1)")
		expect(options[1].textContent).toMatch("bMetric (2)")
		expect(options[2].textContent).toMatch("cMetric (3)")

		await userEvent.click(options[1])
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

		await userEvent.click(await screen.findByText("aMetric (1)"))
		await screen.findByText("search metric (max value)")
		const searchBox = getSearchBox()
		expect(document.activeElement).toBe(searchBox)

		await userEvent.type(getSearchBox(), "b")
		const options = screen.queryAllByRole("option")
		expect(options.length).toBe(1)
		expect(options[0].textContent).toMatch("bMetric (2)")

		await userEvent.click(options[0])
		expect(screen.queryByRole("listbox")).toBeNull()

		await userEvent.click(await screen.findByText("bMetric (2)"))
		expect(getSearchBox().value).toBe("")

		function getSearchBox() {
			const selectContainer = screen.queryByRole("listbox")
			return selectContainer.querySelector("input")
		}
	})

	it("should project hoveredInformation as last child", async () => {
		@Component({
			template: `<cc-metric-chooser
				[searchPlaceholder]="''"
				[selectedMetricName]="'aMetric'"
				[handleMetricChanged]="handleMetricChanged"
			>
				<div hoveredInformation>projected hovered information</div>
			</cc-metric-chooser>`
		})
		class TestMetricChooser {
			handleMetricChanged = jest.fn()
		}
		const { container } = await render(TestMetricChooser)

		expect(container.lastChild.textContent).toBe("projected hovered information")
	})
})
