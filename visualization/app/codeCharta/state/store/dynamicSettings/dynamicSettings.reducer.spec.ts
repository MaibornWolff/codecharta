import { DynamicSettings } from "../../../codeCharta.model"
import { Vector3 } from "three"
import { DEFAULT_SETTINGS, STATE } from "../../../util/dataMocks"
import dynamicSettings from "./dynamicSettings.reducer"
import { DynamicSettingsAction, setDynamicSettings } from "./dynamicSettings.actions"

describe("dynamicSettings", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = dynamicSettings(undefined, {} as DynamicSettingsAction)

			expect(result).toEqual(DEFAULT_SETTINGS.dynamicSettings)
		})
	})

	describe("Action: SET_DYNAMIC_SETTINGS", () => {
		it("should set margin in new dynamicSettings", () => {
			const partialDynamicSettings = {
				margin: 42
			}
			const result = dynamicSettings({} as DynamicSettings, setDynamicSettings(partialDynamicSettings))

			expect(result.margin).toEqual(42)
		})

		it("should set default appSettings", () => {
			const result = dynamicSettings(STATE.dynamicSettings, setDynamicSettings())

			expect(result).toEqual(DEFAULT_SETTINGS.dynamicSettings)
		})
	})
})
