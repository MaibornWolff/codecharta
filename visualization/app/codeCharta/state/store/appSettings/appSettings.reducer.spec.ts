import { AppSettingsAction, setAppSettings } from "./appSettings.actions"
import appSettings from "./appSettings.reducer"
import { AppSettings } from "../../../codeCharta.model"
import { Vector3 } from "three"
import { DEFAULT_SETTINGS } from "../../../util/dataMocks"

describe("appSettings", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = appSettings(undefined, {} as AppSettingsAction)

			expect(result).toEqual(DEFAULT_SETTINGS.appSettings)
		})
	})

	describe("Action: SET_APP_SETTINGS", () => {
		it("should set invertHeight boolean in new appSettings", () => {
			const partialAppSettings = {
				invertHeight: true
			} as AppSettings
			const result = appSettings({} as AppSettings, setAppSettings(partialAppSettings))

			expect(result.invertHeight).toEqual(true)
		})

		it("should set edgeHeight number in new appSettings", () => {
			const partialAppSettings = {
				edgeHeight: 42
			} as AppSettings
			const result = appSettings({} as AppSettings, setAppSettings(partialAppSettings))

			expect(result.edgeHeight).toEqual(42)
		})

		it("should set camera object in new appSettings", () => {
			const partialAppSettings = {
				camera: new Vector3(0, 300, 1000)
			} as AppSettings
			const result = appSettings({} as AppSettings, setAppSettings(partialAppSettings))

			expect(result.camera).toEqual(new Vector3(0, 300, 1000))
		})
	})
})
