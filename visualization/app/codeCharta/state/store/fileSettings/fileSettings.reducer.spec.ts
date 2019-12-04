import { BLACKLIST, DEFAULT_SETTINGS, SETTINGS } from "../../../util/dataMocks"
import fileSettings from "./fileSettings.reducer"
import { FileSettingsAction, setFileSettings } from "./fileSettings.actions"
import { FileSettings } from "../../../codeCharta.model"

describe("fileSettings", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = fileSettings(undefined, {} as FileSettingsAction)

			expect(result).toEqual(DEFAULT_SETTINGS.fileSettings)
		})
	})

	describe("Action: SET_FILE_SETTINGS", () => {
		it("should set blacklist in new fileSettings", () => {
			const partialFileSettings = {
				blacklist: BLACKLIST
			}
			const result = fileSettings({} as FileSettings, setFileSettings(partialFileSettings))

			expect(result.blacklist).toEqual(BLACKLIST)
		})

		it("should set default fileSettings", () => {
			const result = fileSettings(SETTINGS.fileSettings, setFileSettings())

			expect(result).toEqual(DEFAULT_SETTINGS.fileSettings)
		})
	})
})
