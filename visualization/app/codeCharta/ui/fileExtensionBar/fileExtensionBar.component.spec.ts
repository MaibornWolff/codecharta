import "./fileExtensionBar.module"
import _ from "lodash"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import {
	METRIC_DISTRIBUTION,
	NONE_METRIC_DISTRIBUTION,
	TEST_FILE_WITH_PATHS,
	CODE_MAP_BUILDING_TS_NODE,
	VALID_NODE_WITH_PATH_AND_EXTENSION
} from "../../util/dataMocks"
import { FileExtensionCalculator, MetricDistribution } from "../../util/fileExtensionCalculator"
import { FileExtensionBarController } from "./fileExtensionBar.component"
import { BlacklistType, NodeType } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { addBlacklistItem } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { setDistributionMetric } from "../../state/store/dynamicSettings/distributionMetric/distributionMetric.actions"

describe("FileExtensionBarController", () => {
	let fileExtensionBarController: FileExtensionBarController
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let threeSceneService: ThreeSceneService

	let distribution: MetricDistribution[] = METRIC_DISTRIBUTION
	let codeMapBuilding: CodeMapBuilding

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedThreeSceneService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.fileExtensionBar")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")

		codeMapBuilding = _.cloneDeep(CODE_MAP_BUILDING_TS_NODE)
	}

	function rebuildController() {
		fileExtensionBarController = new FileExtensionBarController($rootScope, storeService, threeSceneService)
	}

	function withMockedThreeSceneService() {
		threeSceneService = fileExtensionBarController["threeSceneService"] = jest.fn().mockReturnValue({
			getMapMesh: jest.fn().mockReturnValue({
				getMeshDescription: jest.fn().mockReturnValue({
					buildings: [codeMapBuilding]
				})
			}),
			addBuildingToHighlightingList: jest.fn(),
			highlightBuildings: jest.fn()
		})()
	}

	describe("onRenderMapChanged", () => {
		beforeEach(() => {
			FileExtensionCalculator.getMetricDistribution = jest.fn().mockReturnValue(distribution)
		})
		it("should set viewModel.distribution for given metric", () => {
			fileExtensionBarController.onRenderMapChanged(TEST_FILE_WITH_PATHS.map)

			expect(fileExtensionBarController["_viewModel"].distribution).toEqual(distribution)
		})

		it("should call getMetricDistribution with mcc", () => {
			storeService.dispatch(setDistributionMetric("mcc"))

			fileExtensionBarController.onRenderMapChanged(TEST_FILE_WITH_PATHS.map)

			expect(FileExtensionCalculator.getMetricDistribution).toHaveBeenCalledWith(TEST_FILE_WITH_PATHS.map, "mcc", [])
		})

		it("should call getMetricDistribution with a blacklist", () => {
			const blacklistEntry = { path: "a/path", type: BlacklistType.exclude }
			storeService.dispatch(addBlacklistItem(blacklistEntry))
			storeService.dispatch(setDistributionMetric("mcc"))

			fileExtensionBarController.onRenderMapChanged(TEST_FILE_WITH_PATHS.map)

			expect(FileExtensionCalculator.getMetricDistribution).toHaveBeenCalledWith(
				TEST_FILE_WITH_PATHS.map,
				"mcc",
				storeService.getState().fileSettings.blacklist
			)
		})

		it("should set the color of given extension attribute", () => {
			fileExtensionBarController.onRenderMapChanged(TEST_FILE_WITH_PATHS.map)

			expect(distribution[0].color).toEqual("hsl(58, 40%, 50%)")
		})

		it("should remain the color property of the extension, if it already has one", () => {
			distribution[0].color = "#4286f4"

			fileExtensionBarController.onRenderMapChanged(TEST_FILE_WITH_PATHS.map)

			expect(distribution[0].color).toEqual("#4286f4")
		})

		it("should set viewModel.distribution with just the none Object, if no extension was found for the metric", () => {
			FileExtensionCalculator.getMetricDistribution = jest.fn().mockReturnValue([])

			fileExtensionBarController.onRenderMapChanged(TEST_FILE_WITH_PATHS.map)

			expect(fileExtensionBarController["_viewModel"].distribution).toEqual(NONE_METRIC_DISTRIBUTION)
		})
	})

	describe("toggleExtensiveMode", () => {
		it("should set viewModel.isExtensiveMode to false", () => {
			fileExtensionBarController["_viewModel"].isExtensiveMode = true

			fileExtensionBarController.toggleExtensiveMode()

			expect(fileExtensionBarController["_viewModel"].isExtensiveMode).toBeFalsy()
		})

		it("should set viewModel.isExtensiveMode to true", () => {
			fileExtensionBarController["_viewModel"].isExtensiveMode = false

			fileExtensionBarController.toggleExtensiveMode()

			expect(fileExtensionBarController["_viewModel"].isExtensiveMode).toBeTruthy
		})
	})

	describe("togglePercentageAbsoluteValues", () => {
		it("should set viewModel.isAbsoluteValueVisible to false", () => {
			fileExtensionBarController["_viewModel"].isAbsoluteValueVisible = true

			fileExtensionBarController.togglePercentageAbsoluteValues()

			expect(fileExtensionBarController["_viewModel"].isAbsoluteValueVisible).toBeFalsy()
		})

		it("should set viewModel.isAbsoluteValueVisible to true", () => {
			fileExtensionBarController["_viewModel"].isAbsoluteValueVisible = false

			fileExtensionBarController.togglePercentageAbsoluteValues()

			expect(fileExtensionBarController["_viewModel"].isAbsoluteValueVisible).toBeTruthy()
		})
	})

	describe("highlightBarHoveredBuildings", () => {
		beforeEach(() => {
			const map = _.cloneDeep(VALID_NODE_WITH_PATH_AND_EXTENSION)
			map.children.push({
				name: "README.md",
				type: NodeType.FILE,
				path: "/root/README.md",
				attributes: { rloc: 120, functions: 20, mcc: 2 }
			})
			fileExtensionBarController.onRenderMapChanged(map)
		})

		it("should highlight all buildings with 'other' extension", () => {
			fileExtensionBarController.onHoverFileExtensionBar("other")

			expect(threeSceneService.addBuildingToHighlightingList).toHaveBeenCalledTimes(1)
			expect(threeSceneService.addBuildingToHighlightingList).toHaveBeenCalledWith(codeMapBuilding)
			expect(threeSceneService.highlightBuildings).toHaveBeenCalled()
		})

		it("should call addBuilding to addBuildingToHighlightingList, when a Building with the given file Extension exists ", () => {
			fileExtensionBarController.onHoverFileExtensionBar("ts")

			expect(threeSceneService.addBuildingToHighlightingList).toHaveBeenCalled()
			expect(threeSceneService.highlightBuildings).toHaveBeenCalled()
		})

		it("should not call addBuilding to addBuildingToHighlightingList, when Building with the given file Extension does not exists ", () => {
			fileExtensionBarController.onHoverFileExtensionBar("ne")

			expect(threeSceneService.addBuildingToHighlightingList).not.toHaveBeenCalled()
			expect(threeSceneService.highlightBuildings).toHaveBeenCalled()
		})
	})
})
