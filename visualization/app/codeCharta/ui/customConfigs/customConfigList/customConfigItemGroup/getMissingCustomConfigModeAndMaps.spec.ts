import { getMissingCustomConfigModeAndMaps } from "./getMissingCustomConfigModeAndMaps"
import { CustomConfigMapSelectionMode } from "../../../../model/customConfig/customConfig.api.model"
import { CustomConfigItem } from "../../customConfigs.component"
import { expect } from "@jest/globals"
import { visibleFilesBySelectionModeSelector } from "../../visibleFilesBySelectionMode.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { State } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"

jest.mock("../../visibleFilesBySelectionMode.selector", () => ({
	visibleFilesBySelectionModeSelector: jest.fn()
}))
const mockedVisibleFilesBySelectionModeSelector = jest.mocked(visibleFilesBySelectionModeSelector)

describe("getMissingCustomConfigModeAndMaps", () => {
	const customConfigItem = {
		assignedMaps: new Map([
			["checksum1", "file1"],
			["checksum2", "file2"]
		]),
		mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE
	} as CustomConfigItem
	const state = { getValue: () => defaultState } as State<CcState>

	it("should return empty values when selected maps and map selection mode are the same as the custom config", () => {
		mockedVisibleFilesBySelectionModeSelector.mockImplementationOnce(() => {
			return {
				mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
				assignedMaps: new Map([
					["checksum1", "file1"],
					["checksum2", "file2"]
				])
			}
		})

		const missingModeAndMaps = getMissingCustomConfigModeAndMaps(customConfigItem, state)

		expect(missingModeAndMaps).toEqual({ mapSelectionMode: "", mapNames: [] })
	})

	it("should return missing maps and mode when the values currently selected differ from the custom config", () => {
		mockedVisibleFilesBySelectionModeSelector.mockImplementationOnce(() => {
			return {
				mapSelectionMode: CustomConfigMapSelectionMode.DELTA,
				assignedMaps: new Map([["checksum2", "file2"]])
			}
		})

		const missingModeAndMaps = getMissingCustomConfigModeAndMaps(customConfigItem, state)

		expect(missingModeAndMaps).toEqual({ mapSelectionMode: "STANDARD", mapNames: ["file1"] })
	})
})
