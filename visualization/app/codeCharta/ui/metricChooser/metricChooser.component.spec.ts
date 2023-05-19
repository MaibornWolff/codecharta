import { Component } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { expect } from "@jest/globals"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { MetricChooserComponent } from "./metricChooser.component"
import { MetricChooserModule } from "./metricChooser.module"
import { provideMockStore } from "@ngrx/store/testing"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"
import { attributeDescriptorsSelector } from "../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { TEST_ATTRIBUTE_DESCRIPTORS_FULL } from "../../util/dataMocks"

describe("metricChooserComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MetricChooserModule],
			providers: [
				provideMockStore({
					selectors: [
						{
							selector: metricDataSelector,
							value: {
								nodeMetricData: [
									{ name: "aMetric", maxValue: 1 },
									{ name: "bMetric", maxValue: 2 },
									{ name: "cMetric", maxValue: 3 },
									{ name: "fullMetric", maxValue: 42 },
									{ name: "mcc", maxValue: 55 }
								]
							}
						},
						{ selector: attributeDescriptorsSelector, value: TEST_ATTRIBUTE_DESCRIPTORS_FULL }
					]
				})
			]
		})
	})

	it.only("should be a select for metrics", async () => {
		let selectedMetricName = "aMetric"
		const { rerender } = await render(MetricChooserComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				searchPlaceholder: "search metric (max value)",
				selectedMetricName,
				handleMetricChanged: (value: string) => (selectedMetricName = value)
			}
		})

		await userEvent.click(await screen.findByText("aMetric"))
		const options = screen.queryAllByRole("option")
		expect(options[0].textContent).toMatch("aMetric (1)")
		expect(options[1].textContent).toMatch("bMetric (2)")
		expect(options[2].textContent).toMatch("cMetric (3)")
		expect(options[3].textContent).toMatch("fullMetric (42) FullTestTitle")
		expect(options[3].getAttribute("title")).toMatch(
			"FullTestTitle (fullMetric):\nFullTestDescription\nHigh Values: FullTestHigh\nLow Values: FullLowValue\nhttps://test.abc"
		)
		expect(options[4].textContent).toMatch("mcc (55)")
		expect(options[4].getAttribute("title")).toMatch("Cyclomatic Complexity")

		await userEvent.click(options[1])
		await rerender({
			componentProperties: {
				searchPlaceholder: "search metric (max value)",
				selectedMetricName,
				handleMetricChanged: (value: string) => (selectedMetricName = value)
			}
		})
		expect(screen.queryByText("aMetric")).toBe(null)
		expect(await screen.findByText("bMetric")).not.toBe(null)
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

		await userEvent.click(await screen.findByText("aMetric"))
		screen.getByPlaceholderText("search metric (max value)")
		const searchBox = getSearchBox()
		expect(document.activeElement).toBe(searchBox)

		await userEvent.type(getSearchBox(), "b")
		const options = screen.queryAllByRole("option")
		expect(options.length).toBe(1)
		expect(options[0].textContent).toMatch("bMetric (2)")

		await userEvent.click(options[0])
		expect(screen.queryByRole("listbox")).toBeNull()

		await userEvent.click(await screen.findByText("bMetric"))
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
