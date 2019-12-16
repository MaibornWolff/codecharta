import "./areaSettingsPanel.module"
import "../codeMap/codeMap.module"
import "../../codeCharta.module"
import { AreaSettingsPanelController } from "./areaSettingsPanel.component"
import { SETTINGS, TEST_FILE_WITH_PATHS } from "../../util/dataMocks"
import { FileStateService } from "../../state/fileState.service"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { Settings, CodeMapNode } from "../../codeCharta.model"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { SettingsService } from "../../state/settingsService/settings.service"
import { StoreService } from "../../state/store.service"

describe("AreaSettingsPanelController", () => {
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let storeService: StoreService
	let codeMapPreRenderService: CodeMapPreRenderService
	let areaSettingsPanelController: AreaSettingsPanelController

	let settings: Settings
	let map: CodeMapNode
	let SOME_EXTRA_TIME = 400

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedSettingsService()
		withMockedCodeMapPreRenderService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.areaSettingsPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
		storeService = getService<StoreService>("storeService")
		codeMapPreRenderService = getService<CodeMapPreRenderService>("codeMapPreRenderService")

		settings = JSON.parse(JSON.stringify(SETTINGS))
		map = JSON.parse(JSON.stringify(TEST_FILE_WITH_PATHS.map))
	}

	function rebuildController() {
		areaSettingsPanelController = new AreaSettingsPanelController($rootScope, settingsService, storeService, codeMapPreRenderService)
	}

	function withMockedSettingsService() {
		settingsService = areaSettingsPanelController["settingsService"] = jest.fn().mockReturnValue({
			getSettings: jest.fn().mockReturnValue(settings),
			updateSettings: jest.fn()
		})()
	}

	function withMockedCodeMapPreRenderService() {
		codeMapPreRenderService = areaSettingsPanelController["codeMapPreRenderService"] = jest.fn().mockReturnValue({
			getRenderMap: jest.fn().mockReturnValue(map)
		})()
	}

	describe("constructor", () => {
		beforeEach(() => {
			SettingsService.subscribe = jest.fn()
			CodeMapPreRenderService.subscribe = jest.fn()
			FileStateService.subscribe = jest.fn()
		})

		it("should subscribe to SettingsService", () => {
			rebuildController()

			expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, areaSettingsPanelController)
		})

		it("should subscribe to CodeMapPreRenderService", () => {
			rebuildController()

			expect(CodeMapPreRenderService.subscribe).toHaveBeenCalledWith($rootScope, areaSettingsPanelController)
		})

		it("should subscribe to FileStateService", () => {
			rebuildController()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, areaSettingsPanelController)
		})
	})

	describe("onSettingsChanged", () => {
		beforeEach(() => {
			areaSettingsPanelController.applySettings = jest.fn()
		})

		it("should set the dynamicMargin in viewModel", () => {
			areaSettingsPanelController.onSettingsChanged(settings, undefined)

			expect(areaSettingsPanelController["_viewModel"].dynamicMargin).toBeTruthy()
		})

		it("should set margin from settings if dynamicMargin is false", () => {
			settings.appSettings.dynamicMargin = false

			areaSettingsPanelController.onSettingsChanged(settings, undefined)

			expect(areaSettingsPanelController["_viewModel"].margin).toBe(48)
		})

		it("should set new calculated margin correctly", () => {
			areaSettingsPanelController.onSettingsChanged(settings, undefined)

			expect(areaSettingsPanelController["_viewModel"].margin).toBe(28)
		})

		it("should not call applySettings if margin and new calculated margin are the same", () => {
			settings.dynamicSettings.margin = 28

			areaSettingsPanelController.onSettingsChanged(settings, undefined)

			expect(areaSettingsPanelController.applySettings).not.toHaveBeenCalled()
		})
	})

	describe("onRenderFileChange", () => {
		beforeEach(() => {
			areaSettingsPanelController.applySettings = jest.fn()

			areaSettingsPanelController["makeAutoFit"] = true
			settings.appSettings.dynamicMargin = true
		})

		it("should not call applySettings if dynamicMargin is false", () => {
			settings.appSettings.dynamicMargin = false

			areaSettingsPanelController.onRenderMapChanged(map)

			expect(areaSettingsPanelController.applySettings).not.toHaveBeenCalled()
		})

		it("should set new calculated margin correctly", () => {
			areaSettingsPanelController.onRenderMapChanged(map)

			expect(areaSettingsPanelController["_viewModel"].margin).toBe(28)
		})

		it("should call applySettings after setting new margin", () => {
			areaSettingsPanelController.onRenderMapChanged(map)

			expect(areaSettingsPanelController.applySettings).toHaveBeenCalled()
		})

		it("should not call applySettings if margin and new calculated margin are the same", () => {
			areaSettingsPanelController["_viewModel"].margin = 28

			areaSettingsPanelController.onRenderMapChanged(map)

			expect(areaSettingsPanelController.applySettings).not.toHaveBeenCalled()
		})
	})

	describe("onFileSelectionStatesChanged", () => {
		it("should set dynamicMargin in viewModel to true", () => {
			areaSettingsPanelController.onFileSelectionStatesChanged(undefined)

			expect(areaSettingsPanelController["_viewModel"].dynamicMargin).toBeTruthy()
		})

		it("should update margin and dynamicMargin in settingsService", () => {
			areaSettingsPanelController.onFileSelectionStatesChanged(undefined)

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				appSettings: { dynamicMargin: true }
			})
			expect(storeService.getState().appSettings.dynamicMargin).toBeTruthy()
		})
	})

	describe("onChangeMarginSlider", () => {
		beforeEach(() => {
			areaSettingsPanelController.applySettings = jest.fn()
		})

		it("should set dynamicMargin in viewModel to false", () => {
			areaSettingsPanelController["_viewModel"].dynamicMargin = true

			areaSettingsPanelController.onChangeMarginSlider()

			expect(areaSettingsPanelController["_viewModel"].dynamicMargin).toBeFalsy()
		})

		it("should call updateSettings", done => {
			areaSettingsPanelController["_viewModel"].dynamicMargin = false
			areaSettingsPanelController["_viewModel"].margin = 28
			const expected = { dynamicSettings: { margin: 28 }, appSettings: { dynamicMargin: false } }

			areaSettingsPanelController.onChangeMarginSlider()

			expect(settingsService.updateSettings).toHaveBeenCalledWith(expected)

			setTimeout(() => {
				expect(storeService.getState().dynamicSettings.margin).toEqual(28)
				expect(storeService.getState().appSettings.dynamicMargin).toBeFalsy()
				done()
			}, AreaSettingsPanelController["DEBOUNCE_TIME"] + SOME_EXTRA_TIME)
		})
	})

	describe("applySettingsDynamicMargin", () => {
		it("should call updateSettings with new dynamicMargin value", () => {
			areaSettingsPanelController["_viewModel"].dynamicMargin = false

			areaSettingsPanelController.applySettingsDynamicMargin()

			expect(settingsService.updateSettings).toBeCalledWith({ appSettings: { dynamicMargin: false } })
			expect(storeService.getState().appSettings.dynamicMargin).toBeFalsy()
		})
	})

	describe("applySettings", () => {
		it("should call updateSettings", () => {
			areaSettingsPanelController["_viewModel"].dynamicMargin = false
			areaSettingsPanelController["_viewModel"].margin = 28
			const expected = { dynamicSettings: { margin: 28 }, appSettings: { dynamicMargin: false } }

			areaSettingsPanelController.applySettings()

			expect(settingsService.updateSettings).toHaveBeenCalledWith(expected)
			expect(storeService.getState().dynamicSettings.margin).toEqual(28)
			expect(storeService.getState().appSettings.dynamicMargin).toBeFalsy()
		})
	})
})
