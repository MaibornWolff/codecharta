import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { expect } from "@jest/globals"
import userEvent from "@testing-library/user-event"
import { ColorMetricChooserComponent } from "./colorMetricChooser.component"
import { ColorMetricChooserModule } from "./heightMetricChooser.module"
import { MockState, MockStore, provideMockStore } from "@ngrx/store/testing"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { hoveredNodeSelector } from "../../../state/selectors/hoveredNode.selector"
import { isColorMetricLinkedToHeightMetricSelector } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"
import { colorMetricSelector } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { defaultState } from "../../../state/store/state.manager"
import { State } from "@ngrx/store"

describe("colorMetricChooserComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ColorMetricChooserModule],
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
						{ selector: colorMetricSelector, value: "aMetric" },
						{ selector: hoveredNodeSelector, value: null },
						{ selector: isColorMetricLinkedToHeightMetricSelector, value: false }
					]
				}),
				{ provide: State, useValue: { getValue: () => defaultState } }
			]
		})
	})

	it("should be a select for color metric", async () => {
		const nonDisabledIconColor = "color: rgb(68, 68, 68);"
		const { container } = await render(ColorMetricChooserComponent, { excludeComponentDeclaration: true })

		expect(screen.getByRole("combobox").getAttribute("aria-disabled")).toBe("false")

		await userEvent.click(await screen.findByText("aMetric (1)"))
		expect(screen.getByPlaceholderText("Color Metric (highest value)")).not.toBe(null)
		const options = screen.queryAllByRole("option")
		expect(options[0].textContent).toMatch("aMetric (1)")
		expect(options[1].textContent).toMatch("bMetric (2)")

		await userEvent.click(options[1])
		expect(screen.queryByText("aMetric (1)")).toBe(null)
		expect(screen.queryByText("bMetric (2)")).not.toBe(null)
		expect(container.querySelector(".fa.fa-paint-brush").getAttribute("style")).toEqual(nonDisabledIconColor)
	})

	it("should disable metric chooser when height and color metric are linked", async () => {
		const disabledIconColor = "color: rgba(0, 0, 0, 0.38);"
		const { container, detectChanges } = await render(ColorMetricChooserComponent, { excludeComponentDeclaration: true })
		const store = TestBed.inject(MockStore)
		TestBed.inject(MockState)
		store.overrideSelector(isColorMetricLinkedToHeightMetricSelector, true)
		store.refreshState()
		detectChanges()

		expect(screen.getByRole("combobox").getAttribute("aria-disabled")).toBe("true")
		expect(container.querySelector(".fa.fa-paint-brush").getAttribute("style")).toEqual(disabledIconColor)
	})
})
