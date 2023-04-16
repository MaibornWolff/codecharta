import { TestBed } from "@angular/core/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { expect } from "@jest/globals"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"
import { LegendPanelComponent } from "./legendPanel.component"
import { LegendPanelModule } from "./legendPanel.module"
import { IsAttributeSideBarVisibleService } from "../../services/isAttributeSideBarVisible.service"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { heightMetricSelector } from "../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { areaMetricSelector } from "../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { colorMetricSelector } from "../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { colorRangeSelector } from "../../state/store/dynamicSettings/colorRange/colorRange.selector"
import { State } from "@ngrx/store"
import { mapColorsSelector } from "../../state/store/appSettings/mapColors/mapColors.selector"
import { defaultMapColors } from "../../state/store/appSettings/mapColors/mapColors.reducer"
import { legendHeightMetricSelector } from "./selectors/legendHeightMetric.selector"
import { legendAreaMetricSelector } from "./selectors/legendAreaMetric.selector"
import { legendColorMetricSelector } from "./selectors/legendColorMetric.selector"
import { selectedColorMetricDataSelector } from "../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { getMetricDescriptors } from "../attributeSideBar/util/metricDescriptors"

describe("LegendPanelController", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [LegendPanelModule],
			providers: [
				provideMockStore({
					selectors: [
						{ selector: heightMetricSelector, value: "mcc" },
						{ selector: legendHeightMetricSelector, value: getMetricDescriptors("mcc") },
						{ selector: areaMetricSelector, value: "loc" },
						{ selector: legendAreaMetricSelector, value: getMetricDescriptors("loc") },
						{ selector: colorMetricSelector, value: "rloc" },
						{ selector: legendColorMetricSelector, value: getMetricDescriptors("rloc") },
						{ selector: colorRangeSelector, value: { from: 21, to: 42, max: 9001 } },
						{ selector: isDeltaStateSelector, value: true },
						{ selector: mapColorsSelector, value: defaultMapColors },
						{ selector: selectedColorMetricDataSelector, value: {} }
					]
				}),
				{ provide: State, useValue: {} }
			]
		})
	})

	it("should open and close", async () => {
		const { container } = await render(LegendPanelComponent, { excludeComponentDeclaration: true })

		expect(isLegendPanelOpen(container)).toBe(false)

		const openLegendButton = screen.getByTitle("Show panel")
		fireEvent.click(openLegendButton)
		expect(isLegendPanelOpen(container)).toBe(true)

		const closeLegendButton = screen.getByTitle("Hide panel")
		fireEvent.click(closeLegendButton)
		expect(isLegendPanelOpen(container)).toBe(false)
	})

	it("should display legend for single mode", async () => {
		const { container, detectChanges } = await render(LegendPanelComponent, { excludeComponentDeclaration: true })
		const store = TestBed.inject(MockStore)
		store.overrideSelector(isDeltaStateSelector, false)
		store.refreshState()
		detectChanges()
		fireEvent.click(screen.getByTitle("Show panel"))

		const areDeltaEntriesShown = screen.queryAllByText("delta", { exact: false }).length > 0
		expect(areDeltaEntriesShown).toBe(false)

		const metricDescriptions = container.querySelectorAll("cc-legend-block")
		expect(metricDescriptions[0].textContent).toMatch("Area metric: Lines of Code (loc)")
		expect(metricDescriptions[1].textContent).toMatch("Height metric: Cyclomatic Complexity (mcc)")
		expect(metricDescriptions[2].textContent).toMatch("Color metric: Real Lines of Code (rloc)")
	})

	it("should display legend for delta mode", async () => {
		const { container } = await render(LegendPanelComponent, { excludeComponentDeclaration: true })
		fireEvent.click(screen.getByTitle("Show panel"))

		const areDeltaEntriesShown = screen.queryAllByText("delta", { exact: false }).length > 0
		expect(areDeltaEntriesShown).toBe(true)

		const metricDescriptions = container.querySelectorAll("cc-legend-block")
		expect(metricDescriptions.length).toBe(0)
	})

	it("should add class 'isAttributeSideBarVisible' to opening button, when attribute sidebar is open", async () => {
		const { container } = await render(LegendPanelComponent, {
			excludeComponentDeclaration: true,
			componentProviders: [{ provide: IsAttributeSideBarVisibleService, useValue: { isOpen: true } }]
		})
		const openingButton = container.querySelector(".panel-button")
		expect(openingButton.classList).toContain("isAttributeSideBarVisible")
	})
})

function isLegendPanelOpen(container: Element) {
	return container.querySelector(".block-wrapper").classList.contains("visible")
}
