import { panelSelection } from "./panelSelection.reducer"
import { PanelSelectionAction, setPanelSelection } from "./panelSelection.actions"
import { PanelSelection } from "../../../../codeCharta.model"

describe("panelSelection", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = panelSelection(undefined, {} as PanelSelectionAction)

			expect(result).toEqual(PanelSelection.NONE)
		})
	})

	describe("Action: SET_PANEL_SELECTION", () => {
		it("should set new panelSelection", () => {
			const result = panelSelection(PanelSelection.NONE, setPanelSelection(PanelSelection.AREA_PANEL_OPEN))

			expect(result).toEqual(PanelSelection.AREA_PANEL_OPEN)
		})

		it("should set default panelSelection", () => {
			const result = panelSelection(PanelSelection.AREA_PANEL_OPEN, setPanelSelection())

			expect(result).toEqual(PanelSelection.NONE)
		})
	})
})
