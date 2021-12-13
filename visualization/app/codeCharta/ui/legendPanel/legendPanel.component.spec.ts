import { TestBed } from "@angular/core/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
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

const mockedIsDeltaStateSelector = isDeltaStateSelector as jest.Mock
jest.mock("../../state/selectors/isDeltaState.selector", () => ({
	isDeltaStateSelector: jest.fn()
}))

describe("LegendPanelController", () => {
	// toggle
	// delta
	// edgeMetric

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
})

function isLegendPanelOpen(container: Element) {
	return container.querySelector(".block-wrapper").classList.contains("visible")
}
