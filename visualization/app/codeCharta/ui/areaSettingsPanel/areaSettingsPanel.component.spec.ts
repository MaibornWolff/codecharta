import "./areaSettingsPanel.module"
import "../codeMap/codeMap.module"
import "../../codeCharta.module"
import { AreaSettingsPanelController } from "./areaSettingsPanel.component"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { StoreService } from "../../state/store.service"
import { DynamicMarginService } from "../../state/store/appSettings/dynamicMargin/dynamicMargin.service"
import { MarginService } from "../../state/store/dynamicSettings/margin/margin.service"
import { setDynamicMargin } from "../../state/store/appSettings/dynamicMargin/dynamicMargin.actions"
import { FilesService } from "../../state/store/files/files.service"

describe("AreaSettingsPanelController", () => {
	let areaSettingsPanelController: AreaSettingsPanelController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	let SOME_EXTRA_TIME = 400

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.areaSettingsPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		areaSettingsPanelController = new AreaSettingsPanelController($rootScope, storeService)
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

		it("should subscribe to FilesService", () => {
			FilesService.subscribe = jest.fn()

			rebuildController()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, areaSettingsPanelController)
		})
	})

	describe("onDynamicMarginChanged", () => {
		it("should set the dynamicMargin in viewModel", () => {
			areaSettingsPanelController.onDynamicMarginChanged(true)

			expect(areaSettingsPanelController["_viewModel"].dynamicMargin).toBeTruthy()
		})
	})

	describe("onMarginChanged", () => {
		it("should set margin in viewModel", () => {
			areaSettingsPanelController.onMarginChanged(28)

			expect(areaSettingsPanelController["_viewModel"].margin).toBe(28)
		})
	})

	describe("onFilesChanged", () => {
		it("should set dynamicMargin to true", () => {
			areaSettingsPanelController.onFilesSelectionChanged(undefined)

			expect(storeService.getState().appSettings.dynamicMargin).toBeTruthy()
		})

		it("should update margin and dynamicMargin in store", () => {
			areaSettingsPanelController.onFilesSelectionChanged(undefined)

			expect(storeService.getState().appSettings.dynamicMargin).toBeTruthy()
		})
	})

	describe("onChangeMarginSlider", () => {
		it("should set dynamicMargin to false", () => {
			storeService.dispatch(setDynamicMargin(true))

			areaSettingsPanelController.onChangeMarginSlider()

			expect(storeService.getState().appSettings.dynamicMargin).toBeFalsy()
		})

		it("should update margin and dynamicMargin in store", done => {
			areaSettingsPanelController["_viewModel"].dynamicMargin = false
			areaSettingsPanelController["_viewModel"].margin = 28

			areaSettingsPanelController.onChangeMarginSlider()

			setTimeout(() => {
				expect(storeService.getState().dynamicSettings.margin).toEqual(28)
				expect(storeService.getState().appSettings.dynamicMargin).toBeFalsy()
				done()
			}, AreaSettingsPanelController["DEBOUNCE_TIME"] + SOME_EXTRA_TIME)
		})
	})
})
