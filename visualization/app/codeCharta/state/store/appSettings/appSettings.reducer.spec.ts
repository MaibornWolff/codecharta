import { AppSettingsAction } from "./appSettings.actions"
import appSettings from "./appSettings.reducer"
import { DEFAULT_STATE } from "../../../util/dataMocks"

describe("appSettings", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = appSettings(undefined, {} as AppSettingsAction)

			expect(result).toEqual(DEFAULT_STATE.appSettings)
		})
	})
})
