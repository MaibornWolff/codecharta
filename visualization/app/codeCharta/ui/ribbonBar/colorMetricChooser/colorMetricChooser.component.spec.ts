import { TestBed } from "@angular/core/testing"
import { expect } from "@jest/globals"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { hoveredNodeSelector } from "../../../state/selectors/hoveredNode.selector"
import { isColorMetricLinkedToHeightMetricSelector } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"
import { setColorMetric } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { colorMetricSelector } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { NodeSelectionService } from "../../metricChooser/nodeSelection.service"
import { ColorMetricChooserComponent } from "./colorMetricChooser.component"
import { ColorMetricChooserModule } from "./colorMetricChooser.module"

describe("colorMetricChooserComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ColorMetricChooserModule],
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
						{ selector: colorMetricSelector, value: "aMetric" },
						{ selector: hoveredNodeSelector, value: null },
						{ selector: isColorMetricLinkedToHeightMetricSelector, value: false },
						{ selector: attributeDescriptorsSelector, value: {} }
					]
				})
			]
		})
	})

	it("should be a select for color metric", async () => {
		const nonDisabledIconColor = "color: rgb(68, 68, 68);"
		const { container, detectChanges } = await render(ColorMetricChooserComponent, { excludeComponentDeclaration: true })

		expect(screen.getByRole("combobox").getAttribute("aria-disabled")).toBe("false")

		await userEvent.click(await screen.findByText("aMetric"))
		expect(screen.getByPlaceholderText("Color Metric (highest value)")).not.toBe(null)
		const options = screen.queryAllByRole("option")
		expect(options[0].textContent).toMatch("aMetric (1)")
		expect(options[1].textContent).toMatch("bMetric (2)")

		const store = TestBed.inject(MockStore)
		await userEvent.click(options[1])

		expect(await getLastAction(store)).toEqual(setColorMetric({ value: "bMetric" }))
		store.overrideSelector(colorMetricSelector, "bMetric")
		store.refreshState()
		detectChanges()

		expect(screen.queryByText("aMetric")).toBe(null)
		expect(screen.queryByText("bMetric")).not.toBe(null)
		expect(container.querySelector("cc-metric-chooser").getAttribute("title")).toBe("Change color metric")
		expect(container.querySelector(".fa.fa-paint-brush").getAttribute("style")).toEqual(nonDisabledIconColor)
	})

	it("should disable metric chooser when height and color metric are linked", async () => {
		const disabledIconColor = "color: rgba(0, 0, 0, 0.38);"
		const { container, detectChanges } = await render(ColorMetricChooserComponent, { excludeComponentDeclaration: true })
		const store = TestBed.inject(MockStore)
		store.overrideSelector(isColorMetricLinkedToHeightMetricSelector, true)
		store.refreshState()
		detectChanges()

		expect(screen.getByRole("combobox").getAttribute("aria-disabled")).toBe("true")
		expect(container.querySelector("cc-metric-chooser").getAttribute("title")).toBe("Currently linked to height metric")
		expect(container.querySelector(".fa.fa-paint-brush").getAttribute("style")).toEqual(disabledIconColor)
	})
})
