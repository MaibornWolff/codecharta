import { AppSettingsAction } from "./appSettings.actions"
import appSettings from "./appSettings.reducer"
import { DEFAULT_SETTINGS } from "../../../util/dataMocks"

describe("appSettings", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = appSettings(undefined, {} as AppSettingsAction)

			expect(result).toEqual(DEFAULT_SETTINGS.appSettings)
		})
	})
})
