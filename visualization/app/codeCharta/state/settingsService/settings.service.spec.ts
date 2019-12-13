import "../state.module"
import { SettingsService } from "./settings.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { LoadingStatusService } from "../loadingStatus.service"
import { AttributeTypeValue, RecursivePartial, Settings } from "../../codeCharta.model"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { DEFAULT_SETTINGS, withMockedEventMethods } from "../../util/dataMocks"

describe("settingService", () => {
	let settingsService: SettingsService
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let loadingStatusService: LoadingStatusService

	let settings: Settings
	const SOME_EXTRA_TIME = 400

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
		withMockedLoadingStatusService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
		loadingStatusService = getService<LoadingStatusService>("loadingStatusService")

		settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
	}

	function rebuildService() {
		settingsService = new SettingsService($rootScope, $timeout, loadingStatusService)
	}

	function withMockedLoadingStatusService() {
		loadingStatusService = settingsService["loadingStatusService"] = jest.fn().mockReturnValue({
			updateLoadingMapFlag: jest.fn()
		})()
	}

	describe("constructor", () => {
		it("should set settings to default settings", () => {
			rebuildService()

			expect(settingsService.getSettings()).toEqual(settings)
		})
	})

	describe("updateSettings", () => {
		it("should set settings correctly", () => {
			const expected = {
				...DEFAULT_SETTINGS,
				appSettings: { ...DEFAULT_SETTINGS.appSettings, invertHeight: true }
			}

			settingsService.updateSettings({ appSettings: { invertHeight: true } })

			expect(settingsService.getSettings()).toEqual(expected)
		})

		it("should call updateLoadingMapFlag", () => {
			settingsService.updateSettings({ appSettings: { invertHeight: true } })

			expect(loadingStatusService.updateLoadingMapFlag).toHaveBeenCalledWith(true)
		})

		it("should set attributeTypes", () => {
			const nodeAttributeTypes = [
				{ rloc: AttributeTypeValue.absolute },
				{ mcc: AttributeTypeValue.absolute },
				{ coverage: AttributeTypeValue.relative }
			]

			settingsService.updateSettings({
				fileSettings: {
					attributeTypes: {
						nodes: nodeAttributeTypes
					}
				}
			})

			expect(settingsService.getSettings().fileSettings.attributeTypes.nodes).toEqual(nodeAttributeTypes)
		})

		it("should merge two objects with different root properties", () => {
			settingsService["update"] = { dynamicSettings: { areaMetric: "rloc" } }
			const update = { appSettings: { margin: 2 } } as RecursivePartial<Settings>
			const expected = {
				dynamicSettings: { areaMetric: "rloc" },
				appSettings: { margin: 2 }
			}

			settingsService.updateSettings(update)

			expect(settingsService["update"]).toEqual(expected)
		})

		it("should merge two objects with different non-root properties", () => {
			settingsService["update"] = { dynamicSettings: { areaMetric: "rloc" } }
			const update: RecursivePartial<Settings> = { dynamicSettings: { colorMetric: "mcc" } }
			const expected = {
				dynamicSettings: { areaMetric: "rloc", colorMetric: "mcc" }
			}

			settingsService.updateSettings(update)

			expect(settingsService["update"]).toEqual(expected)
		})

		it("should merge two objects and override one property", () => {
			settingsService["update"] = { dynamicSettings: { areaMetric: "rloc" } }
			const update: RecursivePartial<Settings> = { dynamicSettings: { areaMetric: "mcc" } }
			const expected = {
				dynamicSettings: { areaMetric: "mcc" }
			}

			settingsService.updateSettings(update)

			expect(settingsService["update"]).toEqual(expected)
		})

		it("should merge two objects and override arrays", () => {
			settingsService["update"] = { fileSettings: { blacklist: [] } }
			const update: RecursivePartial<Settings> = { fileSettings: { blacklist: ["entry"] } }
			const expected = {
				fileSettings: { blacklist: ["entry"] }
			}

			settingsService.updateSettings(update)

			expect(settingsService["update"]).toEqual(expected)
		})

		it("should merge two objects and override arrays", () => {
			settingsService["update"] = { fileSettings: { blacklist: ["entry"] } }
			const update: RecursivePartial<Settings> = { fileSettings: { blacklist: [] } }
			const expected = {
				fileSettings: { blacklist: [] }
			}

			settingsService.updateSettings(update)

			expect(settingsService["update"]).toEqual(expected)
		})

		it("should reset update after 400ms", done => {
			settingsService["update"] = { fileSettings: { edges: ["entry"] } }
			const update: RecursivePartial<Settings> = { fileSettings: { edges: [] } }

			settingsService.updateSettings(update)

			setTimeout(() => {
				expect(settingsService["update"]).toEqual({})
				done()
			}, SettingsService["DEBOUNCE_TIME"] + SOME_EXTRA_TIME)
		})
	})

	describe("getDefaultSettings", () => {
		it("should match snapshot", () => {
			expect(settingsService.getDefaultSettings()).toMatchSnapshot()
		})
	})

	describe("subscribe", () => {
		it("should setup one event listener", () => {
			SettingsService.subscribe($rootScope, undefined)

			expect($rootScope.$on).toHaveBeenCalledTimes(1)
		})
	})
})
