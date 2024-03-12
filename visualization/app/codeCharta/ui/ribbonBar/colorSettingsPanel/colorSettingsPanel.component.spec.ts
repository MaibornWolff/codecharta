import { TestBed } from "@angular/core/testing"
import { State, Store, StoreModule } from "@ngrx/store"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { setColorLabels } from "../../../state/store/appSettings/colorLabels/colorLabels.actions"
import { invertColorRange, invertDeltaColors, setMapColors } from "../../../state/store/appSettings/mapColors/mapColors.actions"
import { defaultMapColors } from "../../../state/store/appSettings/mapColors/mapColors.reducer"
import { setColorRange } from "../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"
import { wait } from "../../../util/testUtils/wait"
import { ColorSettingsPanelComponent } from "./colorSettingsPanel.component"
import { ColorSettingsPanelModule } from "./colorSettingsPanel.module"

jest.mock("../../../state/selectors/isDeltaState.selector", () => ({
	isDeltaStateSelector: jest.fn()
}))
jest.mock("../../../state/store/dynamicSettings/colorRange/colorRange.selector", () => ({
	colorRangeSelector: () => ({ from: 33, to: 66 })
}))

const mockedIsDeltaStateSelector = jest.mocked(isDeltaStateSelector)

describe("colorSettingsPanelComponent", () => {
	mockedIsDeltaStateSelector.mockImplementation(() => false)
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ColorSettingsPanelModule, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
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
			await userEvent.click(invertColors)

			expect(dispatchSpy).toHaveBeenLastCalledWith(invertColorRange())
		})

		it("should allow to show labels for negative color", async () => {
			await render(ColorSettingsPanelComponent, { excludeComponentDeclaration: true })
			const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")

			const showNegativeLabels = screen.queryAllByText("Show labels")[2]
			await userEvent.click(showNegativeLabels)

			expect(dispatchSpy).toHaveBeenCalledWith(setColorLabels({ value: { negative: true } }))
		})

		it("should reset invert colors checkbox on resetting colors", async () => {
			const { fixture } = await render(ColorSettingsPanelComponent, { excludeComponentDeclaration: true })

			await userEvent.click(screen.getByText("Invert Colors"))
			expect(fixture.componentInstance.isColorRangeInverted).toBe(true)

			await userEvent.click(screen.getByText("Reset colors"))
			expect(fixture.componentInstance.isColorRangeInverted).toBe(false)
		})

		it("should update store debounced without loosing an update and track it", async () => {
			const { fixture } = await render(ColorSettingsPanelComponent, { excludeComponentDeclaration: true })
			const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")

			fixture.componentInstance.handleValueChange({ newLeftValue: 10 })
			fixture.componentInstance.handleValueChange({ newRightValue: 20 })

			expect(dispatchSpy).not.toHaveBeenCalled()

			await wait(400)
			expect(dispatchSpy).toHaveBeenCalledWith(setColorRange({ value: { from: 10, to: 20 } }))
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
			await userEvent.click(invertColors)

			expect(dispatchSpy).toHaveBeenLastCalledWith(invertDeltaColors())
		})

		it("should reset delta colors", async () => {
			await render(ColorSettingsPanelComponent, { excludeComponentDeclaration: true })
			const store = TestBed.inject(Store)
			store.dispatch(
				setMapColors({
					value: {
						positiveDelta: "#000000",
						negativeDelta: "#000000",
						selected: "#000000"
					}
				})
			)

			const resetColors = screen.getByText("Reset colors")
			await userEvent.click(resetColors)

			const state = TestBed.inject(State)
			const mapColors = state.getValue().appSettings.mapColors
			expect(mapColors.positiveDelta).toBe(defaultMapColors.positiveDelta)
			expect(mapColors.negativeDelta).toBe(defaultMapColors.negativeDelta)
			expect(mapColors.selected).toBe(defaultMapColors.selected)
		})
	})
})
