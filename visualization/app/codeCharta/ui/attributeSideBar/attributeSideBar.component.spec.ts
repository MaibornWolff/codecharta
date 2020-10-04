import "./attributeSideBar.module"
import { AttributeSideBarController, PrimaryMetrics } from "./attributeSideBar.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CODE_MAP_BUILDING, TEST_NODE_LEAF } from "../../util/dataMocks"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { AreaMetricService } from "../../state/store/dynamicSettings/areaMetric/areaMetric.service"
import { HeightMetricService } from "../../state/store/dynamicSettings/heightMetric/heightMetric.service"
import { EdgeMetricService } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.service"
import { ColorMetricService } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"
import { IsAttributeSideBarVisibleService } from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.service"
import { StoreService } from "../../state/store.service"
import { openAttributeSideBar } from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.actions"
import { klona } from 'klona';

describe("AttributeSideBarController", () => {
	let attributeSideBarController: AttributeSideBarController
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let codeMapPreRenderService: CodeMapPreRenderService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.attributeSideBar")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		codeMapPreRenderService = getService<CodeMapPreRenderService>("codeMapPreRenderService")
	}

	function rebuildController() {
		attributeSideBarController = new AttributeSideBarController($rootScope, storeService, codeMapPreRenderService)
	}

	function withMockedCodeMapPreRenderService() {
		codeMapPreRenderService.getRenderFileMeta = jest.fn().mockReturnValue({ fileName: "my_fileName" })
		attributeSideBarController["codeMapPreRenderService"] = codeMapPreRenderService
	}

	describe("constructor", () => {
		it("should subscribe to Node Selected Events", () => {
			ThreeSceneService.subscribeToBuildingSelectedEvents = jest.fn()

			rebuildController()

			expect(ThreeSceneService.subscribeToBuildingSelectedEvents).toHaveBeenCalledWith($rootScope, attributeSideBarController)
		})

		it("should subscribe to AreaMetricService", () => {
			AreaMetricService.subscribe = jest.fn()

			rebuildController()

			expect(AreaMetricService.subscribe).toHaveBeenCalledWith($rootScope, attributeSideBarController)
		})

		it("should subscribe to HeightMetricService", () => {
			HeightMetricService.subscribe = jest.fn()

			rebuildController()

			expect(HeightMetricService.subscribe).toHaveBeenCalledWith($rootScope, attributeSideBarController)
		})

		it("should subscribe to ColorMetricService", () => {
			ColorMetricService.subscribe = jest.fn()

			rebuildController()

			expect(ColorMetricService.subscribe).toHaveBeenCalledWith($rootScope, attributeSideBarController)
		})

		it("should subscribe to EdgeMetricService", () => {
			EdgeMetricService.subscribe = jest.fn()

			rebuildController()

			expect(EdgeMetricService.subscribe).toHaveBeenCalledWith($rootScope, attributeSideBarController)
		})

		it("should subscribe to IsAttributeSideBarVisibleService Events", () => {
			IsAttributeSideBarVisibleService.subscribe = jest.fn()

			rebuildController()

			expect(IsAttributeSideBarVisibleService.subscribe).toHaveBeenCalledWith($rootScope, attributeSideBarController)
		})
	})

	describe("onBuildingSelected", () => {
		let codeMapBuilding: CodeMapBuilding

		beforeEach(() => {
			withMockedCodeMapPreRenderService()
			attributeSideBarController["updateSortedMetricKeysWithoutPrimaryMetrics"] = jest.fn()
			codeMapBuilding = klona(CODE_MAP_BUILDING)
		})

		it("should set new viewModel node", () => {
			attributeSideBarController.onBuildingSelected(codeMapBuilding)

			expect(attributeSideBarController["_viewModel"].node).toBe(codeMapBuilding.node)
		})

		it("should call function to update secondaryMetricKeys", () => {
			attributeSideBarController.onBuildingSelected(codeMapBuilding)

			expect(attributeSideBarController["updateSortedMetricKeysWithoutPrimaryMetrics"]).toHaveBeenCalled()
		})

		it("should get fileName from codeMapPreRenderService", () => {
			attributeSideBarController.onBuildingSelected(codeMapBuilding)

			expect(attributeSideBarController["_viewModel"].fileName).toEqual("my_fileName")
		})
	})

	describe("onAreaMetricChanged", () => {
		let areaMetric: string

		beforeEach(() => {
			attributeSideBarController["updateSortedMetricKeysWithoutPrimaryMetrics"] = jest.fn()
			areaMetric = "myAreaMetric"
		})

		it("should set new viewModel areaMetric", () => {
			attributeSideBarController.onAreaMetricChanged(areaMetric)

			expect(attributeSideBarController["_viewModel"].primaryMetricKeys.node.area).toBe(areaMetric)
		})

		it("should call function to update secondaryMetricKeys", () => {
			attributeSideBarController.onAreaMetricChanged(areaMetric)

			expect(attributeSideBarController["updateSortedMetricKeysWithoutPrimaryMetrics"]).toHaveBeenCalled()
		})
	})

	describe("onHeightMetricChanged", () => {
		let heightMetric: string

		beforeEach(() => {
			attributeSideBarController["updateSortedMetricKeysWithoutPrimaryMetrics"] = jest.fn()
			heightMetric = "myHeightMetric"
		})

		it("should set new viewModel heightMetric", () => {
			attributeSideBarController.onHeightMetricChanged(heightMetric)

			expect(attributeSideBarController["_viewModel"].primaryMetricKeys.node.height).toBe(heightMetric)
		})

		it("should call function to update secondaryMetricKeys", () => {
			attributeSideBarController.onHeightMetricChanged(heightMetric)

			expect(attributeSideBarController["updateSortedMetricKeysWithoutPrimaryMetrics"]).toHaveBeenCalled()
		})
	})

	describe("onColorMetricChanged", () => {
		let colorMetric: string

		beforeEach(() => {
			attributeSideBarController["updateSortedMetricKeysWithoutPrimaryMetrics"] = jest.fn()
			colorMetric = "myColorMetric"
		})

		it("should set new viewModel colorMetric", () => {
			attributeSideBarController.onColorMetricChanged(colorMetric)

			expect(attributeSideBarController["_viewModel"].primaryMetricKeys.node.color).toBe(colorMetric)
		})

		it("should call function to update secondaryMetricKeys", () => {
			attributeSideBarController.onColorMetricChanged(colorMetric)

			expect(attributeSideBarController["updateSortedMetricKeysWithoutPrimaryMetrics"]).toHaveBeenCalled()
		})
	})

	describe("onEdgeMetricChanged", () => {
		let edgeMetric: string

		beforeEach(() => {
			attributeSideBarController["updateSortedMetricKeysWithoutPrimaryMetrics"] = jest.fn()
			edgeMetric = "myEdgeMetric"
		})

		it("should set new viewModel edgeMetric", () => {
			attributeSideBarController.onEdgeMetricChanged(edgeMetric)

			expect(attributeSideBarController["_viewModel"].primaryMetricKeys.edge.edge).toBe(edgeMetric)
		})

		it("should call function to update secondaryMetricKeys", () => {
			attributeSideBarController.onEdgeMetricChanged(edgeMetric)

			expect(attributeSideBarController["updateSortedMetricKeysWithoutPrimaryMetrics"]).toHaveBeenCalled()
		})
	})

	describe("onClickCloseSideBar", () => {
		it("should call set isAttributeSideBarVisible to false", () => {
			storeService.dispatch(openAttributeSideBar())

			attributeSideBarController.onClickCloseSideBar()

			expect(storeService.getState().appSettings.isAttributeSideBarVisible).toBeFalsy()
		})
	})

	describe("updateSortedMetricKeysWithoutPrimaryMetrics", () => {
		beforeEach(() => {
			attributeSideBarController["_viewModel"].node = klona(TEST_NODE_LEAF)
			attributeSideBarController["_viewModel"].node.attributes = {
				a: 1,
				b: 2,
				c: 3,
				d: 4,
				e: 5
			}
		})

		it("should filter node.attributes by selected metricKeys 1", () => {
			attributeSideBarController["_viewModel"].primaryMetricKeys = {
				node: {
					area: "a"
				}
			} as PrimaryMetrics

			attributeSideBarController["updateSortedMetricKeysWithoutPrimaryMetrics"]()

			expect(attributeSideBarController["_viewModel"].secondaryMetricKeys).toEqual(["b", "c", "d", "e"])
		})

		it("should filter node.attributes by selected metricKeys 2", () => {
			attributeSideBarController["_viewModel"].primaryMetricKeys = {
				node: {
					area: "a",
					color: "c",
					height: "e"
				}
			} as PrimaryMetrics

			attributeSideBarController["updateSortedMetricKeysWithoutPrimaryMetrics"]()

			expect(attributeSideBarController["_viewModel"].secondaryMetricKeys).toEqual(["b", "d"])
		})
	})
})
