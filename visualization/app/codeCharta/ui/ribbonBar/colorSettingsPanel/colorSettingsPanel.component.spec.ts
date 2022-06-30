import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { mocked } from "ts-jest/utils"
import { Store } from "../../../state/angular-redux/store"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { setColorLabels } from "../../../state/store/appSettings/colorLabels/colorLabels.actions"
import { invertColorRange, invertDeltaColors, setMapColors } from "../../../state/store/appSettings/mapColors/mapColors.actions"
import { ColorSettingsPanelComponent } from "./colorSettingsPanel.component"
import { ColorSettingsPanelModule } from "./colorSettingsPanel.module"

jest.mock("../../../state/selectors/isDeltaState.selector", () => ({
	isDeltaStateSelector: jest.fn()
}))

const mockedIsDeltaStateSelector = mocked(isDeltaStateSelector)

describe("colorSettingsPanelComponent", () => {
	mockedIsDeltaStateSelector.mockImplementation(() => false)
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ColorSettingsPanelModule]
		})
	})

	describe("standard mode", () => {
		beforeEach(() => {
			mockedIsDeltaStateSelector.mockImplementation(() => false)
		})

		it("should show relevant elements for standard mode", async () => {
			const { container } = await render(ColorSettingsPanelComponent, { excludeComponentDeclaration: true })
			expect(container.querySelector("cc-metric-color-range-slider")).not.toBe(null)
			expect(screen.queryAllByText("Show labels").length).toBe(3)
			expect(screen.queryByText("+Δ positive delta")).toBe(null)
			expect(screen.queryByText("–Δ negative delta")).toBe(null)
		})

		it("should invert color range", async () => {
			await render(ColorSettingsPanelComponent, { excludeComponentDeclaration: true })
			const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")

			const invertColors = screen.getByText("Invert Colors")
			userEvent.click(invertColors)

			expect(dispatchSpy).toHaveBeenLastCalledWith(invertColorRange())
		})

		it("should allow to show labels for negative color", async () => {
			await render(ColorSettingsPanelComponent, { excludeComponentDeclaration: true })
			const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")

			const showNegativeLabels = screen.queryAllByText("Show labels")[2]
			userEvent.click(showNegativeLabels)

			expect(dispatchSpy).toHaveBeenCalledWith(setColorLabels({ negative: true }))
		})

		it("should reset invert colors checkbox on resetting colors", async () => {
			const { fixture } = await render(ColorSettingsPanelComponent, { excludeComponentDeclaration: true })

			userEvent.click(screen.getByText("Invert Colors"))
			expect(fixture.componentInstance.isColorRangeInverted).toBe(true)

			userEvent.click(screen.getByText("Reset colors"))
			expect(fixture.componentInstance.isColorRangeInverted).toBe(false)
		})
	})

	describe("delta mode", () => {
		beforeEach(() => {
			mockedIsDeltaStateSelector.mockImplementation(() => true)
		})

		it("should show relevant elements for delta mode", async () => {
			const { container } = await render(ColorSettingsPanelComponent, { excludeComponentDeclaration: true })
			expect(container.querySelector("cc-metric-color-range-slider")).toBe(null)
			expect(screen.queryByText("Show labels")).toBe(null)
			expect(screen.getByText("+Δ positive delta")).not.toBe(null)
			expect(screen.getByText("–Δ negative delta")).not.toBe(null)
		})

		it("should invert delta colors", async () => {
			await render(ColorSettingsPanelComponent, { excludeComponentDeclaration: true })
			const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")

			const invertColors = screen.getByText("Invert Colors")
			userEvent.click(invertColors)

			expect(dispatchSpy).toHaveBeenLastCalledWith(invertDeltaColors())
		})

		it("should reset delta colors", async () => {
			await render(ColorSettingsPanelComponent, { excludeComponentDeclaration: true })
			const store = TestBed.inject(Store)
			const dispatchSpy = jest.spyOn(store, "dispatch")

			store.dispatch(
				setMapColors({
					positiveDelta: "#000000",
					negativeDelta: "#000000",
					selected: "#000000"
				})
			)

			const resetColors = screen.getByText("Reset colors")
			userEvent.click(resetColors)

			// The following will only work after migration of custom logic in app/codeCharta/state/store.service.ts
			// const state = TestBed.inject(State)
			// const mapColors = state.getValue().appSettings.mapColors
			// expect(mapColors.positiveDelta).toBe(defaultMapColors.positiveDelta)
			// expect(mapColors.negativeDelta).toBe(defaultMapColors.negativeDelta)
			// expect(mapColors.selected).toBe(defaultMapColors.selected)
			// Therefore testing that the "SET_STATE" action was fired correctly for now
			expect(dispatchSpy).toHaveBeenCalledWith({
				type: "SET_STATE",
				payload: {
					appSettings: {
						mapColors: {
							positiveDelta: "#64d051",
							negativeDelta: "#ff0E0E",
							selected: "#EB8319"
						}
					}
				}
			})
		})
	})
})
