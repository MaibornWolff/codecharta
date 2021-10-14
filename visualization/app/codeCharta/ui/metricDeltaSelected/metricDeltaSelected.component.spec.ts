import { render, screen } from "@testing-library/angular"

import { Store } from "../../state/store/store"
import { ColorConverter } from "../../util/color/colorConverter"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { MetricDeltaSelectedComponent } from "./metricDeltaSelected.component"

describe("MetricDeltaSelectedComponent", () => {
	const areColorsEqual = (hex: string, styleColor: string) => {
		const formattedHex = ColorConverter.convertHexToRgba(hex).replace(/,1\)$/, ")").replace("a", "")
		const formattedStyleColor = styleColor.replace(/ /g, "")
		return formattedHex === formattedStyleColor
	}

	beforeEach(() => {
		Store["initialize"]()
	})

	it("should not show, if there is no delta value", async () => {
		await render(MetricDeltaSelectedComponent)
		expect(screen.queryByText(/Δ/)).toBe(null)
	})

	it("should show in positive delta color when selected building has a positive delta value", async () => {
		const fakeCodeMapBuilding = { node: { deltas: { rloc: 2 } } } as unknown as CodeMapBuilding
		const state = Store.store.getState()
		state.appStatus.selectedBuildingId = 0
		state.lookUp.idToBuilding = new Map()
		state.lookUp.idToBuilding.set(0, fakeCodeMapBuilding)

		await render(MetricDeltaSelectedComponent, {
			componentProperties: { attributeKey: "rloc" }
		})

		const metricDeltaSelectedDomNode = screen.queryByText(/Δ2/)
		expect(metricDeltaSelectedDomNode).toBeTruthy()
		expect(areColorsEqual(state.appSettings.mapColors.positiveDelta, metricDeltaSelectedDomNode.style.color)).toBe(true)
	})

	it("should show in negative delta color when selected building has a negative delta value", async () => {
		const fakeCodeMapBuilding = { node: { deltas: { rloc: -2 } } } as unknown as CodeMapBuilding
		const state = Store.store.getState()
		state.appStatus.selectedBuildingId = 0
		state.lookUp.idToBuilding = new Map()
		state.lookUp.idToBuilding.set(0, fakeCodeMapBuilding)

		await render(MetricDeltaSelectedComponent, {
			componentProperties: { attributeKey: "rloc" }
		})

		const metricDeltaSelectedDomNode = screen.queryByText(/Δ-2/)
		expect(metricDeltaSelectedDomNode).toBeTruthy()
		expect(areColorsEqual(state.appSettings.mapColors.negativeDelta, metricDeltaSelectedDomNode.style.color)).toBe(true)
	})

	it("should update when its attributeKey changes", async () => {
		const fakeCodeMapBuilding = { node: { deltas: { rloc: 2, mcc: 4 } } } as unknown as CodeMapBuilding
		const state = Store.store.getState()
		state.appStatus.selectedBuildingId = 0
		state.lookUp.idToBuilding = new Map()
		state.lookUp.idToBuilding.set(0, fakeCodeMapBuilding)

		const { rerender } = await render(MetricDeltaSelectedComponent, {
			componentProperties: { attributeKey: "rloc" }
		})
		expect(screen.queryByText(/Δ2/)).toBeTruthy()

		await rerender({ attributeKey: "mcc" })
		expect(screen.queryByText(/Δ4/)).toBeTruthy()
	})
})
