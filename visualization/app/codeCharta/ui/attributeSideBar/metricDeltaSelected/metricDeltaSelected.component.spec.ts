import { render, screen } from "@testing-library/angular"
import { idToNodeSelector } from "../../../state/selectors/accumulatedData/idToNode.selector"
import { Store } from "../../../state/store/store"

import { ColorConverter } from "../../../util/color/colorConverter"
import { MetricDeltaSelectedComponent } from "./metricDeltaSelected.component"

jest.mock("../../../state/selectors/accumulatedData/idToNode.selector", () => ({
	idToNodeSelector: jest.fn()
}))
const mockedIdToNodeSelector = jest.mocked(idToNodeSelector)
jest.mock("../../../state/store/appStatus/selectedBuildingId/selectedBuildingId.selector", () => ({
	selectedBuildingIdSelector: () => 0
}))

describe("MetricDeltaSelectedComponent", () => {
	const areColorsEqual = (hex: string, styleColor: string) => {
		const formattedHex = ColorConverter.convertHexToRgba(hex).replace(/,1\)$/, ")").replace("a", "")
		const formattedStyleColor = styleColor.replace(/ /g, "")
		return formattedHex === formattedStyleColor
	}

	it("should not show, if there is no delta value", async () => {
		await render(MetricDeltaSelectedComponent)
		expect(screen.queryByText(/Δ/)).toBe(null)
	})

	it("should show in positive delta color when selected building has a positive delta value", async () => {
		mockIdToNodeSelector({ rloc: 2 })

		await render(MetricDeltaSelectedComponent, {
			componentProperties: { metricName: "rloc" }
		})

		const metricDeltaSelectedDomNode = screen.queryByText(/Δ2/)
		expect(metricDeltaSelectedDomNode).toBeTruthy()
		expect(areColorsEqual(Store.store.getState().appSettings.mapColors.positiveDelta, metricDeltaSelectedDomNode.style.color)).toBe(
			true
		)
	})

	it("should show in negative delta color when selected building has a negative delta value", async () => {
		mockIdToNodeSelector({ rloc: -2 })

		await render(MetricDeltaSelectedComponent, {
			componentProperties: { metricName: "rloc" }
		})

		const metricDeltaSelectedDomNode = screen.queryByText(/Δ-2/)
		expect(metricDeltaSelectedDomNode).toBeTruthy()
		expect(areColorsEqual(Store.store.getState().appSettings.mapColors.negativeDelta, metricDeltaSelectedDomNode.style.color)).toBe(
			true
		)
	})

	it("should update when its metricName changes", async () => {
		mockIdToNodeSelector({ rloc: 2, mcc: 4 })

		const { rerender } = await render(MetricDeltaSelectedComponent, {
			componentProperties: { metricName: "rloc" }
		})
		expect(screen.queryByText(/Δ2/)).toBeTruthy()

		await rerender({ metricName: "mcc" })
		expect(screen.queryByText(/Δ4/)).toBeTruthy()
	})

	function mockIdToNodeSelector(deltas: Record<string, unknown>) {
		const idToNode = new Map()
		idToNode.set(0, { id: 0, deltas })
		mockedIdToNodeSelector.mockImplementation(() => idToNode)
	}
})
