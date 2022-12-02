import { TestBed } from "@angular/core/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { expect } from "@jest/globals"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"
import { LegendPanelComponent } from "./legendPanel.component"
import { LegendPanelModule } from "./legendPanel.module"

jest.mock("../../state/store/dynamicSettings/heightMetric/heightMetric.selector", () => ({
	heightMetricSelector: () => "mcc"
}))
jest.mock("../../state/store/dynamicSettings/areaMetric/areaMetric.selector", () => ({
	areaMetricSelector: () => "loc"
}))
jest.mock("../../state/store/dynamicSettings/colorMetric/colorMetric.selector", () => ({
	colorMetricSelector: () => "rloc"
}))
jest.mock("../../state/store/dynamicSettings/colorRange/colorRange.selector", () => ({
	colorRangeSelector: () => ({ from: 21, to: 42, max: 9001 })
}))

const mockedIsDeltaStateSelector = isDeltaStateSelector as jest.Mock
jest.mock("../../state/selectors/isDeltaState.selector", () => ({
	isDeltaStateSelector: jest.fn()
}))

describe("LegendPanelController", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [LegendPanelModule]
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
		mockedIsDeltaStateSelector.mockImplementation(() => false)
		const { container } = await render(LegendPanelComponent, { excludeComponentDeclaration: true })
		fireEvent.click(screen.getByTitle("Show panel"))

		const areDeltaEntriesShown = screen.queryAllByText("delta", { exact: false }).length > 0
		expect(areDeltaEntriesShown).toBe(false)

		const metricDescriptions = container.querySelectorAll("cc-legend-block")
		expect(metricDescriptions[0].textContent).toMatch("Area metric: Lines of Code (loc)")
		expect(metricDescriptions[1].textContent).toMatch("Height metric: Cyclomatic Complexity (mcc)")
		expect(metricDescriptions[2].textContent).toMatch("Color metric: Real Lines of Code (rloc)")
	})

	it("should display legend for delta mode", async () => {
		mockedIsDeltaStateSelector.mockImplementation(() => true)
		const { container } = await render(LegendPanelComponent, { excludeComponentDeclaration: true })
		fireEvent.click(screen.getByTitle("Show panel"))

		const areDeltaEntriesShown = screen.queryAllByText("delta", { exact: false }).length > 0
		expect(areDeltaEntriesShown).toBe(true)

		const metricDescriptions = container.querySelectorAll("cc-legend-block")
		expect(metricDescriptions.length).toBe(0)
	})
})

function isLegendPanelOpen(container: Element) {
	return container.querySelector(".block-wrapper").classList.contains("visible")
}
