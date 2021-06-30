import "./metricDeltaSelected.module"
import { MetricDeltaSelectedController } from "./metricDeltaSelected.component"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService, ITimeoutService } from "angular"
import { CODE_MAP_BUILDING } from "../../util/dataMocks"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { StoreService } from "../../state/store.service"
import { klona } from "klona"
import { MapColorsService } from "../../state/store/appSettings/mapColors/mapColors.service"
import { setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"

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

		it("should subscribe to MapColorsServiceService", () => {
			MapColorsService.subscribe = jest.fn()

			rebuildController()

			expect(MapColorsService.subscribe).toHaveBeenCalledWith($rootScope, metricDeltaSelectedController)
		})
	})

	describe("onBuildingSelected", () => {
		it("should set color to positiveDeltaColor if deltaValue is positive", () => {
			const positiveDeltaColor = storeService.getState().appSettings.mapColors.positiveDelta
			metricDeltaSelectedController["_viewModel"].deltaValue = 1

			metricDeltaSelectedController.onBuildingSelected()

			expect(metricDeltaSelectedController["_viewModel"].style.color).toEqual(positiveDeltaColor)
		})

		it("should set color to negativeDeltaColor if deltaValue is negative", () => {
			const negativeDeltaColor = storeService.getState().appSettings.mapColors.negativeDelta
			metricDeltaSelectedController["_viewModel"].deltaValue = -1

			metricDeltaSelectedController.onBuildingSelected()

			expect(metricDeltaSelectedController["_viewModel"].style.color).toEqual(negativeDeltaColor)
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

	describe("onMapColorsChanged", () => {
		it("should set color to new positiveDelta color", () => {
			storeService.dispatch(
				setMapColors({
					...storeService.getState().appSettings.mapColors,
					positiveDelta: "#666666"
				})
			)
			metricDeltaSelectedController["_viewModel"].deltaValue = 1

			metricDeltaSelectedController.onBuildingSelected()

			expect(metricDeltaSelectedController["_viewModel"].style.color).toEqual("#666666")
		})
	})
})
