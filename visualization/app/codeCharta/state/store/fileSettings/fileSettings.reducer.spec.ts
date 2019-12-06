import { DEFAULT_SETTINGS } from "../../../util/dataMocks"
import fileSettings from "./fileSettings.reducer"
import { FileSettingsAction } from "./fileSettings.actions"

describe("fileSettings", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = fileSettings(undefined, {} as FileSettingsAction)

			expect(result).toEqual(DEFAULT_SETTINGS.fileSettings)
		})
	})
})
