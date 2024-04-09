import { Component, ViewChild } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { MatSelectModule } from "@angular/material/select"
import { expect } from "@jest/globals"
import { provideMockStore } from "@ngrx/store/testing"
import { getByText, queryByText, render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { MaterialModule } from "../../../material/material.module"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"
import { attributeDescriptorsSelector } from "../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { TEST_ATTRIBUTE_DESCRIPTORS_FULL } from "../../util/dataMocks"
import { MetricChooserComponent } from "./metricChooser.component"
import { MetricChooserModule } from "./metricChooser.module"

describe("metricChooserComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [MetricChooserComponent],
			imports: [MetricChooserModule, MatSelectModule, MaterialModule],
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

	it("should be a select for metrics", async () => {
		let selectedMetricName = "aMetric"
		const { rerender, detectChanges } = await render(MetricChooserComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				searchPlaceholder: "search metric (max value)",
				selectedMetricName,
				handleMetricChanged: (value: string) => (selectedMetricName = value)
			}
		})

		await userEvent.click(await screen.findByText("aMetric"))
		await waitFor(() => expect(screen.queryAllByRole("option")[0].textContent).toMatch("aMetric (1)"))
		await waitFor(() => expect(screen.queryAllByRole("option")[1].textContent).toMatch("bMetric (2)"))
		await waitFor(() => expect(screen.queryAllByRole("option")[2].textContent).toMatch("cMetric (3)"))
		await waitFor(() => expect(screen.queryAllByRole("option")[3].textContent).toMatch("fullMetric (42) FullTestDescription"))
		await waitFor(() =>
			expect(screen.queryAllByRole("option")[3].getAttribute("title")).toMatch(
				"FullTestTitle (fullMetric):\nFullTestDescription\nHigh Values: FullTestHigh\nLow Values: FullLowValue"
			)
		)
		await waitFor(() => expect(screen.queryAllByRole("option")[4].textContent).toMatch("mcc (55)"))
		await waitFor(() => expect(screen.queryAllByRole("option")[4].getAttribute("title")).toMatch("Cyclomatic Complexity"))

		await userEvent.click(screen.queryAllByRole("option")[1])

		await rerender({
			componentProperties: {
				searchPlaceholder: "search metric (max value)",
				selectedMetricName,
				handleMetricChanged: (value: string) => (selectedMetricName = value)
			}
		})
		detectChanges()
		expect(screen.queryByText("aMetric")).toBe(null)
		expect(screen.queryByText("bMetric")).not.toBe(null)
	})

	it("should focus search field initially, filter options by search term, and reset search term on close", async () => {
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
		await waitFor(() => expect(screen.getByPlaceholderText("search metric (max value)")).toBeTruthy())
		expect(document.activeElement).toBe(getSearchBox())

		await userEvent.type(getSearchBox(), "b")
		await waitFor(() => expect(screen.queryAllByRole("option").length).toBe(1))
		await waitFor(() => expect(screen.queryAllByRole("option")[0].textContent).toMatch("bMetric (2)"))

		await userEvent.click(screen.queryAllByRole("option")[0])
		await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull())

		await rerender({
			componentProperties: {
				searchPlaceholder: "search metric (max value)",
				selectedMetricName,
				handleMetricChanged: (value: string) => (selectedMetricName = value)
			}
		})
		await userEvent.click(await screen.findByText("bMetric"))
		await waitFor(() => expect(getSearchBox().value).toBe(""))

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

	it("should hide metric sum field when options menu is opened", async () => {
		const content = "Projected content"
		const metricChooserTemplate = `
			<cc-metric-chooser>
				<div hoveredInformation class="metric-value">${content}</div>
			</cc-metric-chooser>
		`

		@Component({
			template: metricChooserTemplate
		})
		class WrapperComponent {
			@ViewChild(MetricChooserComponent, { static: true }) metricChooserComponentRef: MetricChooserComponent
		}

		const { container, fixture } = await render(WrapperComponent, {
			declarations: [MetricChooserComponent, WrapperComponent]
		})

		const metricChooserComponent: MetricChooserComponent = fixture.debugElement.componentInstance.metricChooserComponentRef

		expect(metricChooserComponent).not.toBeNull()
		await waitFor(() => {
			expect(getByText(container as HTMLElement, content)).not.toBeNull()
		})

		metricChooserComponent.handleOpenedChanged(true)

		await waitFor(() => {
			expect(queryByText(container as HTMLElement, content)).toBeNull()
		})
	})
})
