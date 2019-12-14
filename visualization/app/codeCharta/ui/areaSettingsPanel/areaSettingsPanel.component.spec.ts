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
import { DynamicMarginService } from "../../state/store/appSettings/dynamicMargin/dynamicMargin.service"
import { MarginService } from "../../state/store/dynamicSettings/margin/margin.service"
import { setAreaMetric } from "../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { setDynamicMargin } from "../../state/store/appSettings/dynamicMargin/dynamicMargin.actions"

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
		it("should subscribe to DynamicMarginService", () => {
			DynamicMarginService.subscribe = jest.fn()

			rebuildController()

			expect(DynamicMarginService.subscribe).toHaveBeenCalledWith($rootScope, areaSettingsPanelController)
		})

		it("should subscribe to MarginService", () => {
			MarginService.subscribe = jest.fn()

			rebuildController()

			expect(MarginService.subscribe).toHaveBeenCalledWith($rootScope, areaSettingsPanelController)
		})

		it("should subscribe to CodeMapPreRenderService", () => {
			CodeMapPreRenderService.subscribe = jest.fn()

			rebuildController()

			expect(CodeMapPreRenderService.subscribe).toHaveBeenCalledWith($rootScope, areaSettingsPanelController)
		})

		it("should subscribe to FileStateService", () => {
			FileStateService.subscribe = jest.fn()

			rebuildController()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, areaSettingsPanelController)
		})
	})

	describe("onDynamicMarginChanged", () => {
		it("should set the dynamicMargin in viewModel", () => {
			areaSettingsPanelController.onDynamicMarginChanged(true)

			expect(areaSettingsPanelController["_viewModel"].dynamicMargin).toBeTruthy()
		})

		it("should set margin from settings if dynamicMargin is false", () => {
			areaSettingsPanelController["_viewModel"].margin = 48

			areaSettingsPanelController.onDynamicMarginChanged(false)

			expect(areaSettingsPanelController["_viewModel"].margin).toEqual(48)
		})

		it("should set new calculated margin correctly", () => {
			storeService.dispatch(setAreaMetric("rloc"))

			areaSettingsPanelController.onDynamicMarginChanged(true)

			expect(storeService.getState().dynamicSettings.margin).toEqual(28)
		})
	})

	describe("onMarginChanged", () => {
		it("should not call applySettings if margin and new calculated margin are the same", () => {
			areaSettingsPanelController.onMarginChanged(28)

			expect(areaSettingsPanelController["_viewModel"].margin).toBe(28)
		})
	})

	describe("onRenderFileChange", () => {
		beforeEach(() => {
			settings.appSettings.dynamicMargin = true
		})

		it("should not call dispatch if dynamicMargin is false", () => {
			storeService.dispatch(setDynamicMargin(false))
			storeService.dispatch = jest.fn()

			areaSettingsPanelController.onRenderMapChanged(map)

			expect(storeService.dispatch).not.toHaveBeenCalled()
		})

		it("should set new calculated margin correctly", () => {
			areaSettingsPanelController["_viewModel"].dynamicMargin = true
			storeService.dispatch(setAreaMetric("rloc"))

			areaSettingsPanelController.onRenderMapChanged(map)

			expect(storeService.getState().dynamicSettings.margin).toEqual(28)
		})

		it("should call dispatch after setting new margin", () => {
			areaSettingsPanelController["_viewModel"].dynamicMargin = true
			storeService.dispatch(setAreaMetric("rloc"))
			storeService.dispatch = jest.fn()

			areaSettingsPanelController.onRenderMapChanged(map)

			expect(storeService.dispatch).toHaveBeenCalled()
		})

		it("should not call applySettings if margin and new calculated margin are the same", () => {
			areaSettingsPanelController["_viewModel"].margin = 28
			areaSettingsPanelController["_viewModel"].dynamicMargin = true
			storeService.dispatch(setAreaMetric("rloc"))
			storeService.dispatch = jest.fn()

			areaSettingsPanelController.onRenderMapChanged(map)

			expect(storeService.dispatch).not.toHaveBeenCalled()
		})
	})

	describe("onFileSelectionStatesChanged", () => {
		it("should set dynamicMargin to true", () => {
			areaSettingsPanelController.onFileSelectionStatesChanged(undefined)

			expect(storeService.getState().appSettings.dynamicMargin).toBeTruthy()
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
		it("should set dynamicMargin to false", () => {
			storeService.dispatch(setDynamicMargin(true))

			areaSettingsPanelController.onChangeMarginSlider()

			expect(storeService.getState().appSettings.dynamicMargin).toBeFalsy()
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
})
