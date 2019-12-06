import { DEFAULT_SETTINGS } from "../../../util/dataMocks"
import fileSettings from "./treeMap.reducer"
import { TreeMapSettingsAction } from "./treeMap.actions"

describe("treeMapSettings", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = fileSettings(undefined, {} as TreeMapSettingsAction)

			expect(result).toEqual(DEFAULT_SETTINGS.treeMapSettings)
		})
	})
})
