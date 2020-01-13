import { DEFAULT_STATE } from "../../../util/dataMocks"
import treeMap from "./treeMap.reducer"
import { TreeMapSettingsAction } from "./treeMap.actions"

describe("treeMap", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = treeMap(undefined, {} as TreeMapSettingsAction)

			expect(result).toEqual(DEFAULT_STATE.treeMap)
		})
	})
})
