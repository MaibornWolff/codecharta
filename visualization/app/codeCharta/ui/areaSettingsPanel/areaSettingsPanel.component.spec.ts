import "./areaSettingsPanel.module"
import "../codeMap/codeMap.module"
import "../../codeCharta"
import { AreaSettingsPanelController } from "./areaSettingsPanel.component"
import { SettingsService } from "../../state/settings.service"
import { SETTINGS, TEST_FILE_WITH_PATHS } from "../../util/dataMocks"
import { FileStateService } from "../../state/fileState.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { CodeMapRenderService } from "../codeMap/codeMap.render.service"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { CCFile, Settings } from "../../codeCharta.model"

describe("AreaSettingsPanelController", () => {

	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let settingsService: SettingsService
	let codeMapRenderService: CodeMapRenderService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let areaSettingsPanelController: AreaSettingsPanelController

	let settings: Settings
	let file: CCFile

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedSettingsService()
		withMockedCodeMapRenderService()
		withMockedThreeOrbitControlsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.areaSettingsPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
		settingsService = getService<SettingsService>("settingsService")
		codeMapRenderService = getService<CodeMapRenderService>("codeMapRenderService")
		threeOrbitControlsService = getService<ThreeOrbitControlsService>("threeOrbitControlsService")

		settings = JSON.parse(JSON.stringify(SETTINGS))
		file = JSON.parse(JSON.stringify(TEST_FILE_WITH_PATHS))
	}

	function rebuildController() {
		areaSettingsPanelController = new AreaSettingsPanelController($rootScope, $timeout, settingsService, codeMapRenderService, threeOrbitControlsService)
	}

	function withMockedSettingsService() {
		settingsService = areaSettingsPanelController["settingsService"] = jest.fn().mockReturnValue({
			getSettings: jest.fn().mockReturnValue(settings),
			updateSettings: jest.fn()
		})()
	}

	function withMockedCodeMapRenderService() {
		codeMapRenderService = areaSettingsPanelController["codeMapRenderService"] = jest.fn().mockReturnValue({
			getRenderFile: jest.fn().mockReturnValue(file)
		})()
	}

	function withMockedThreeOrbitControlsService() {
		threeOrbitControlsService = areaSettingsPanelController["threeOrbitControlsService"] = jest.fn().mockReturnValue({
			autoFitTo: jest.fn()
		})()
	}

	describe("constructor", () => {
		beforeEach(() => {
			SettingsService.subscribe = jest.fn()
			CodeMapRenderService.subscribe = jest.fn()
			FileStateService.subscribe = jest.fn()
		})

		it("should subscribe to SettingsService", () => {
			rebuildController()

			expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, areaSettingsPanelController)
		})

		it("should subscribe to CodeMapRenderService", () => {
			rebuildController()

			expect(CodeMapRenderService.subscribe).toHaveBeenCalledWith($rootScope, areaSettingsPanelController)
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

		it("should call applySettings after setting new margin", () => {
			areaSettingsPanelController.onSettingsChanged(settings, undefined)

			expect(areaSettingsPanelController.applySettings).toHaveBeenCalled()
		})

		it("should not call applySettings if margin and new calculated margin are the same", () => {
			areaSettingsPanelController["_viewModel"].margin = 28

			areaSettingsPanelController.onSettingsChanged(settings, undefined)

			expect(areaSettingsPanelController.applySettings).not.toHaveBeenCalled()
		})
	})

	describe("onRenderFileChange", () => {
		beforeEach(() => {
			areaSettingsPanelController.applySettings = jest.fn()

			areaSettingsPanelController["makeAutoFit"] = true
			areaSettingsPanelController["_viewModel"].dynamicMargin = true
		})

		it("should not call applySettings if dynamicMargin is false", () => {
			areaSettingsPanelController["_viewModel"].dynamicMargin = false

			areaSettingsPanelController.onRenderFileChanged(file, undefined)

			expect(areaSettingsPanelController.applySettings).not.toHaveBeenCalled()
		})

		it("should not call applySettings if makeAutoFit is false", () => {
			areaSettingsPanelController["makeAutoFit"] = false

			areaSettingsPanelController.onRenderFileChanged(file, undefined)

			expect(areaSettingsPanelController.applySettings).not.toHaveBeenCalled()
		})

		it("should set new calculated margin correctly", () => {
			areaSettingsPanelController.onRenderFileChanged(file, undefined)

			expect(areaSettingsPanelController["_viewModel"].margin).toBe(28)
		})

		it("should call applySettings after setting new margin", () => {
			areaSettingsPanelController.onRenderFileChanged(file, undefined)

			expect(areaSettingsPanelController.applySettings).toHaveBeenCalled()
		})

		it("should call autoFitTo after flush after setting new margin", () => {
			areaSettingsPanelController.onRenderFileChanged(file, undefined)
			$timeout.flush()

			expect(threeOrbitControlsService.autoFitTo).toHaveBeenCalled()
		})

		it("should set makeAutoFit to false after setting new margin", () => {
			areaSettingsPanelController.onRenderFileChanged(file, undefined)

			expect(areaSettingsPanelController["makeAutoFit"]).toBeFalsy()
		})

		it("should not call applySettings if margin and new calculated margin are the same", () => {
			areaSettingsPanelController["_viewModel"].margin = 28

			areaSettingsPanelController.onRenderFileChanged(file, undefined)

			expect(areaSettingsPanelController.applySettings).not.toHaveBeenCalled()
		})
	})

	describe("onFileSelectionStateChanged", () => {
		it("should set makeAutoFit to true", () => {
			areaSettingsPanelController["makeAutoFit"] = false

			areaSettingsPanelController.onFileSelectionStatesChanged(null, null)

			expect(areaSettingsPanelController["makeAutoFit"]).toBeTruthy()
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

		it("should call applySettings after updating viewModel", () => {
			areaSettingsPanelController.onChangeMarginSlider()

			expect(areaSettingsPanelController.applySettings).toHaveBeenCalled()
		})
	})

	describe("onClickDynamicMargin", () => {
		beforeEach(() => {
			areaSettingsPanelController.applySettings = jest.fn()
		})

		it("should not set margin if dynamicMargin is false", () => {
			areaSettingsPanelController["_viewModel"].dynamicMargin = false

			areaSettingsPanelController.onClickDynamicMargin()

			expect(areaSettingsPanelController["_viewModel"].margin).toBeNull()
		})

		it("should set margin correctly", () => {
			areaSettingsPanelController["_viewModel"].dynamicMargin = true

			areaSettingsPanelController.onClickDynamicMargin()

			expect(areaSettingsPanelController["_viewModel"].margin).toBe(28)
		})

		it("should call applySettings", () => {
			areaSettingsPanelController.onClickDynamicMargin()

			expect(areaSettingsPanelController.applySettings).toHaveBeenCalled()
		})
	})

	describe("applySettings", () => {
		it("should call updateSettings", () => {
			areaSettingsPanelController["_viewModel"].dynamicMargin = false
			areaSettingsPanelController["_viewModel"].margin = 28
			const expected = { dynamicSettings: { margin: 28 }, appSettings: { dynamicMargin: false } }

			areaSettingsPanelController.applySettings()

			expect(settingsService.updateSettings).toHaveBeenCalledWith(expected)
		})
	})
})