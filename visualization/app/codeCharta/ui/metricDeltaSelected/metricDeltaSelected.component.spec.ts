import "./metricDeltaSelected.module"
import { MetricDeltaSelectedController } from "./metricDeltaSelected.component"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService, ITimeoutService } from "angular"
import { CODE_MAP_BUILDING } from "../../util/dataMocks"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { StoreService } from "../../state/store.service"
import { InvertDeltaColorsService } from "../../state/store/appSettings/invertDeltaColors/invertDeltaColors.service"
import { setInvertDeltaColors } from "../../state/store/appSettings/invertDeltaColors/invertDeltaColors.actions"
import { klona } from "klona"

describe("MetricDeltaSelectedController", () => {
	let metricDeltaSelectedController: MetricDeltaSelectedController
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let storeService: StoreService
	let threeSceneService: ThreeSceneService
	let codeMapBuilding: CodeMapBuilding

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedThreeSceneService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.metricDeltaSelected")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
		storeService = getService<StoreService>("storeService")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")

		codeMapBuilding = klona(CODE_MAP_BUILDING)
	}

	function rebuildController() {
		metricDeltaSelectedController = new MetricDeltaSelectedController($rootScope, $timeout, threeSceneService, storeService)
	}

	function withMockedThreeSceneService() {
		threeSceneService = jest.fn().mockReturnValue({
			getSelectedBuilding: jest.fn()
		})()
	}

	describe("constructor", () => {
		it("should subscribe to Node Selected Events", () => {
			ThreeSceneService.subscribeToBuildingSelectedEvents = jest.fn()

			rebuildController()

			expect(ThreeSceneService.subscribeToBuildingSelectedEvents).toHaveBeenCalledWith($rootScope, metricDeltaSelectedController)
		})

		it("should subscribe to InvertDeltaColorsService", () => {
			InvertDeltaColorsService.subscribe = jest.fn()

			rebuildController()

			expect(InvertDeltaColorsService.subscribe).toHaveBeenCalledWith($rootScope, metricDeltaSelectedController)
		})
	})

	describe("onBuildingSelected", () => {
		it("should set colorClass to red with inverted deltaColor and positive deltaValue", () => {
			storeService.dispatch(setInvertDeltaColors(true))
			metricDeltaSelectedController["_viewModel"].deltaValue = 1

			metricDeltaSelectedController.onBuildingSelected()

			expect(metricDeltaSelectedController["_viewModel"].colorClass).toEqual("red")
		})

		it("should set colorClass to green with inverted deltaColor and negative deltaValue", () => {
			storeService.dispatch(setInvertDeltaColors(true))
			metricDeltaSelectedController["_viewModel"].deltaValue = -1

			metricDeltaSelectedController.onBuildingSelected()

			expect(metricDeltaSelectedController["_viewModel"].colorClass).toEqual("green")
		})

		it("should set colorClass to green without inverted deltaColor and positive deltaValue", () => {
			storeService.dispatch(setInvertDeltaColors(false))
			metricDeltaSelectedController["_viewModel"].deltaValue = 1

			metricDeltaSelectedController.onBuildingSelected()

			expect(metricDeltaSelectedController["_viewModel"].colorClass).toEqual("green")
		})

		it("should set colorClass to red without inverted deltaColor and negative deltaValue", () => {
			storeService.dispatch(setInvertDeltaColors(false))
			metricDeltaSelectedController["_viewModel"].deltaValue = -1

			metricDeltaSelectedController.onBuildingSelected()

			expect(metricDeltaSelectedController["_viewModel"].colorClass).toEqual("red")
		})

		it("should set deltaValue to null", () => {
			codeMapBuilding.node.deltas = undefined

			metricDeltaSelectedController.onBuildingSelected(codeMapBuilding)

			expect(metricDeltaSelectedController["_viewModel"].deltaValue).toEqual(undefined)
		})

		it("should set deltaValue to existing metric value", () => {
			codeMapBuilding.node.deltas = { rloc: 42 }
			metricDeltaSelectedController["attributekey"] = "rloc"

			metricDeltaSelectedController.onBuildingSelected(codeMapBuilding)

			expect(metricDeltaSelectedController["_viewModel"].deltaValue).toEqual(42)
		})

		it("should not change viewModel", () => {
			metricDeltaSelectedController["_viewModel"].deltaValue = 17

			metricDeltaSelectedController.onBuildingSelected()

			expect(metricDeltaSelectedController["_viewModel"].deltaValue).toEqual(17)
		})
	})

	describe("onInvertDeltaColorsChanged", () => {
		it("should set colorClass to red with inverted deltaColor and positive deltaValue", () => {
			storeService.dispatch(setInvertDeltaColors(true))
			metricDeltaSelectedController["_viewModel"].deltaValue = 1

			metricDeltaSelectedController.onBuildingSelected()

			expect(metricDeltaSelectedController["_viewModel"].colorClass).toEqual("red")
		})

		it("should set colorClass to green with inverted deltaColor and negative deltaValue", () => {
			storeService.dispatch(setInvertDeltaColors(true))
			metricDeltaSelectedController["_viewModel"].deltaValue = -1

			metricDeltaSelectedController.onBuildingSelected()

			expect(metricDeltaSelectedController["_viewModel"].colorClass).toEqual("green")
		})

		it("should set colorClass to green without inverted deltaColor and positive deltaValue", () => {
			storeService.dispatch(setInvertDeltaColors(false))
			metricDeltaSelectedController["_viewModel"].deltaValue = 1

			metricDeltaSelectedController.onBuildingSelected()

			expect(metricDeltaSelectedController["_viewModel"].colorClass).toEqual("green")
		})

		it("should set colorClass to red without inverted deltaColor and negative deltaValue", () => {
			storeService.dispatch(setInvertDeltaColors(false))
			metricDeltaSelectedController["_viewModel"].deltaValue = -1

			metricDeltaSelectedController.onBuildingSelected()

			expect(metricDeltaSelectedController["_viewModel"].colorClass).toEqual("red")
		})
	})
})
