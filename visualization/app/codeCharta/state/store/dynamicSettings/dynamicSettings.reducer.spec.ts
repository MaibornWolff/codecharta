import { DEFAULT_STATE } from "../../../util/dataMocks"
import dynamicSettings from "./dynamicSettings.reducer"
import { DynamicSettingsAction } from "./dynamicSettings.actions"

describe("dynamicSettings", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = dynamicSettings(undefined, {} as DynamicSettingsAction)

			expect(result).toEqual(DEFAULT_STATE.dynamicSettings)
		})
	})
})
