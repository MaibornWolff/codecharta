import { DEFAULT_STATE } from "../../../util/dataMocks"
import fileSettings from "./treeMap.reducer"
import { TreeMapSettingsAction } from "./treeMap.actions"

describe("treeMapSettings", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = fileSettings(undefined, {} as TreeMapSettingsAction)

			expect(result).toEqual(DEFAULT_STATE.treeMap)
		})
	})
})
