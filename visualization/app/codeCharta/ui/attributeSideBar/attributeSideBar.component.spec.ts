import "./attributeSideBar.module"
import { AttributeSideBarController, PrimaryMetrics } from "./attributeSideBar.component"
import { AttributeSideBarService } from "./attributeSideBar.service"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { CODE_MAP_BUILDING, TEST_NODE_LEAF } from "../../util/dataMocks"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import _ from "lodash"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"

describe("AttributeSideBarController", () => {
	let attributeSideBarController: AttributeSideBarController
	let $rootScope: IRootScopeService
	let codeMapPreRenderService: CodeMapPreRenderService
	let attributeSideBarService: AttributeSideBarService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.attributeSideBar")

		$rootScope = getService<IRootScopeService>("$rootScope")
		codeMapPreRenderService = getService<CodeMapPreRenderService>("codeMapPreRenderService")
		attributeSideBarService = getService<AttributeSideBarService>("attributeSideBarService")
	}

	function rebuildController() {
		attributeSideBarController = new AttributeSideBarController($rootScope, codeMapPreRenderService, attributeSideBarService)
	}

	function withMockedCodeMapPreRenderService() {
		codeMapPreRenderService = attributeSideBarController["codeMapPreRenderService"] = jest.fn<CodeMapPreRenderService>(() => {
			return {
				getRenderFileMeta: jest.fn().mockReturnValue({ fileName: "my_fileName" })
			}
		})()
	}

	describe("constructor", () => {
		it("should subscribe to Node Selected Events", () => {
			ThreeSceneService.subscribeToBuildingSelectedEvents = jest.fn()

			rebuildController()

			expect(ThreeSceneService.subscribeToBuildingSelectedEvents).toHaveBeenCalledWith($rootScope, attributeSideBarController)
		})

		it("should subscribe to AreaMetric Events", () => {
			SettingsService.subscribeToAreaMetric = jest.fn()

			rebuildController()

			expect(SettingsService.subscribeToAreaMetric).toHaveBeenCalledWith($rootScope, attributeSideBarController)
		})

		it("should subscribe to HeightMetric Events", () => {
			SettingsService.subscribeToHeightMetric = jest.fn()

			rebuildController()

			expect(SettingsService.subscribeToHeightMetric).toHaveBeenCalledWith($rootScope, attributeSideBarController)
		})

		it("should subscribe to ColorMetric Events", () => {
			SettingsService.subscribeToColorMetric = jest.fn()

			rebuildController()

			expect(SettingsService.subscribeToColorMetric).toHaveBeenCalledWith($rootScope, attributeSideBarController)
		})

		it("should subscribe to EdgeMetric Events", () => {
			SettingsService.subscribeToEdgeMetric = jest.fn()

			rebuildController()

			expect(SettingsService.subscribeToEdgeMetric).toHaveBeenCalledWith($rootScope, attributeSideBarController)
		})

		it("should subscribe to AttributeSideBarService Events", () => {
			AttributeSideBarService.subscribe = jest.fn()

			rebuildController()

			expect(AttributeSideBarService.subscribe).toHaveBeenCalledWith($rootScope, attributeSideBarController)
		})
	})

	describe("onBuildingSelected", () => {
		let codeMapBuilding: CodeMapBuilding

		beforeEach(() => {
			withMockedCodeMapPreRenderService()
			attributeSideBarController["updateSortedMetricKeysWithoutPrimaryMetrics"] = jest.fn()
			codeMapBuilding = _.cloneDeep(CODE_MAP_BUILDING)
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
		beforeEach(() => {
			attributeSideBarService.closeSideBar = jest.fn()
		})

		it("should call attributeSideBarService.closeSideBar", () => {
			attributeSideBarController.onClickCloseSideBar()

			expect(attributeSideBarService.closeSideBar).toHaveBeenCalled()
		})
	})

	describe("updateSortedMetricKeysWithoutPrimaryMetrics", () => {
		beforeEach(() => {
			attributeSideBarController["_viewModel"].node = _.cloneDeep(TEST_NODE_LEAF)
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
