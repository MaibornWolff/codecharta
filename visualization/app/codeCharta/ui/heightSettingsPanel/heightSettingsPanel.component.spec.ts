import "./heightSettingsPanel.module"

import { Vector3 } from "three"
import { HeightSettingsPanelController } from "./heightSettingsPanel.component"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { StoreService } from "../../state/store.service"
import { AmountOfTopLabelsService } from "../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.service"
import { ScalingService } from "../../state/store/appSettings/scaling/scaling.service"
import { InvertHeightService } from "../../state/store/appSettings/invertHeight/invertHeight.service"
import { FilesService } from "../../state/store/files/files.service"
import { TEST_DELTA_MAP_A } from "../../util/dataMocks"
import { addFile, setDelta } from "../../state/store/files/files.actions"
import { LabelShowNodeNameService } from "../../state/store/appSettings/showMetricLabelNameValue/labelShowNodeNameService"
import { LabelShowMetricValueService } from "../../state/store/appSettings/showMetricLabelNodeName/labelShowMetricValueService"
import { ColorLabelsService } from "../../state/store/appSettings/colorLabels/colorLabels.service"
import { colorLabelOptions } from "../../codeCharta.model"

describe("HeightSettingsPanelController", () => {
	const wait = async (ms: number) => new Promise<void>(resolve => setTimeout(() => resolve(), ms))

	let heightSettingsPanelController: HeightSettingsPanelController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	const SOME_EXTRA_TIME = 400

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.heightSettingsPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		heightSettingsPanelController = new HeightSettingsPanelController($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to AmountOfTopLabelsService", () => {
			AmountOfTopLabelsService.subscribe = jest.fn()

			rebuildController()

			expect(AmountOfTopLabelsService.subscribe).toHaveBeenCalledWith($rootScope, heightSettingsPanelController)
		})

		it("should subscribe to ScalingService", () => {
			ScalingService.subscribe = jest.fn()

			rebuildController()

			expect(ScalingService.subscribe).toHaveBeenCalledWith($rootScope, heightSettingsPanelController)
		})

		it("should subscribe to InvertHeightService", () => {
			InvertHeightService.subscribe = jest.fn()

			rebuildController()

			expect(InvertHeightService.subscribe).toHaveBeenCalledWith($rootScope, heightSettingsPanelController)
		})

		it("should subscribe to FilesService", () => {
			FilesService.subscribe = jest.fn()

			rebuildController()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, heightSettingsPanelController)
		})

		it("should subscribe to LabelShowNodeNameService", () => {
			LabelShowNodeNameService.subscribe = jest.fn()

			rebuildController()

			expect(LabelShowNodeNameService.subscribe).toHaveBeenCalledWith($rootScope, heightSettingsPanelController)
		})

		it("should subscribe to LabelShowMetricValueService", () => {
			LabelShowMetricValueService.subscribe = jest.fn()

			rebuildController()

			expect(LabelShowMetricValueService.subscribe).toHaveBeenCalledWith($rootScope, heightSettingsPanelController)
		})

		it("should subscribe to ColorLabelService", () => {
			ColorLabelsService.subscribe = jest.fn()

			rebuildController()

			expect(ColorLabelsService.subscribe).toHaveBeenCalledWith($rootScope, heightSettingsPanelController)
		})
	})

	describe("onAmountOfTopLabelsChanged", () => {
		it("should set amountOfTopLabels in viewModel", () => {
			heightSettingsPanelController.onAmountOfTopLabelsChanged(31)

			expect(heightSettingsPanelController["_viewModel"].amountOfTopLabels).toBe(31)
		})
	})

	describe("onInvertHeightChanged", () => {
		it("should set invertHeight in viewModel", () => {
			heightSettingsPanelController.onInvertHeightChanged(true)

			expect(heightSettingsPanelController["_viewModel"].invertHeight).toBeTruthy()
		})
	})

	describe("onScalingChanged", () => {
		it("should set scalingY in viewModel", () => {
			heightSettingsPanelController.onScalingChanged(new Vector3(0, 1.8, 0))

			expect(heightSettingsPanelController["_viewModel"].scalingY).toBe(1.8)
		})
	})

	describe("onFilesSelectionChanged", () => {
		it("should set isDeltaState in viewModel", () => {
			storeService.dispatch(addFile(TEST_DELTA_MAP_A))
			storeService.dispatch(setDelta(TEST_DELTA_MAP_A, TEST_DELTA_MAP_A))

			heightSettingsPanelController.onFilesSelectionChanged(storeService.getState().files)

			expect(heightSettingsPanelController["_viewModel"].isDeltaState).toBe(true)
		})
	})

	describe("onShowMetricLabelNameValueChanged", () => {
		it("should set showMetricValue in viewModel", () => {
			heightSettingsPanelController.onShowMetricLabelNameValueChanged(false)

			expect(heightSettingsPanelController["_viewModel"].showMetricValue).toBeFalsy()
		})
	})

	describe("onShowMetricLabelNodeNameChanged", () => {
		it("should set showNodeName in viewModel", () => {
			heightSettingsPanelController.onShowMetricLabelNodeNameChanged(false)

			expect(heightSettingsPanelController["_viewModel"].showNodeName).toBeFalsy()
		})
	})

	describe("applySettingsAmountOfTopLabels", () => {
		it("should update amountOfTopLabels in store", async () => {
			heightSettingsPanelController["_viewModel"].amountOfTopLabels = 12

			heightSettingsPanelController.applySettingsAmountOfTopLabels()

			await wait(HeightSettingsPanelController["DEBOUNCE_TIME"] + SOME_EXTRA_TIME)
			expect(storeService.getState().appSettings.amountOfTopLabels).toBe(12)
		})
	})

	describe("onColorLabelsChanged", () => {
		it("should set sliderDisabled in viewModel to true if one option is truthy", () => {
			const colorLabelsNeg: colorLabelOptions = {
				positive: false,
				negative: true,
				neutral: false
			}
			heightSettingsPanelController.onColorLabelsChanged(colorLabelsNeg)
			expect(heightSettingsPanelController["_viewModel"].sliderDisabled).toBeTruthy()
		})

		it("should set sliderDisabled in viewModel to true if multiple options are truthy", () => {
			const colorLabelsPosNeut: colorLabelOptions = {
				positive: true,
				negative: false,
				neutral: true
			}
			heightSettingsPanelController.onColorLabelsChanged(colorLabelsPosNeut)
			expect(heightSettingsPanelController["_viewModel"].sliderDisabled).toBeTruthy()
		})

		it("should set sliderDisabled in viewModel to false if no color label options are truthy", () => {
			const colorLabelsFalse: colorLabelOptions = {
				positive: false,
				negative: false,
				neutral: false
			}
			heightSettingsPanelController.onColorLabelsChanged(colorLabelsFalse)
			expect(heightSettingsPanelController["_viewModel"].sliderDisabled).toBeFalsy()
		})
	})

	describe("applySettingsInvertHeight", () => {
		it("should update invertHeight in store", () => {
			heightSettingsPanelController["_viewModel"].invertHeight = true

			heightSettingsPanelController.applySettingsInvertHeight()

			expect(storeService.getState().appSettings.invertHeight).toBeTruthy()
		})
	})

	describe("applySettingsScaling", () => {
		it("should update scaling in store", async () => {
			heightSettingsPanelController["_viewModel"].scalingY = 1.8

			heightSettingsPanelController.applySettingsScaling()

			await wait(HeightSettingsPanelController["DEBOUNCE_TIME"] + SOME_EXTRA_TIME)
			expect(storeService.getState().appSettings.scaling).toEqual(new Vector3(1, 1.8, 1))
		})
	})

	describe("applySettingsMetricLabelValueChanged", () => {
		it("should update showMetricLabelNameValue in store", () => {
			heightSettingsPanelController["_viewModel"].showMetricValue = false

			heightSettingsPanelController.applySettingsMetricLabelValueChanged()

			expect(storeService.getState().appSettings.showMetricLabelNameValue).toBeFalsy()
		})
	})

	describe("applySettingsMetricLabelNodeNameChanged", () => {
		it("should update showMetricLabelNodeName in store", () => {
			heightSettingsPanelController["_viewModel"].showNodeName = false

			heightSettingsPanelController.applySettingsMetricLabelNodeNameChanged()

			expect(storeService.getState().appSettings.showMetricLabelNodeName).toBeFalsy()
		})
	})
})
