import "./mapTreeView.module"
import { MapTreeViewController } from "./mapTreeView.component"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { CodeMapNode, SortingOption } from "../../codeCharta.model"
import {
	decorateFiles,
	VALID_NODE_WITH_MULTIPLE_FOLDERS,
	VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_UNARY,
	VALID_NODE_NUMBERS_AND_DIACTRIC_CHARACHTERS,
	VALID_NODE_NUMBERS_AND_DIACTRIC_CHARACHTERS_SORTED
} from "../../util/dataMocks"
import { StoreService } from "../../state/store.service"
import { SortingOrderAscendingService } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.service"
import { SortingOptionService } from "../../state/store/dynamicSettings/sortingOption/sortingOption.service"
import { klona } from "klona"

describe("MapTreeViewController", () => {
	let mapTreeViewController: MapTreeViewController
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let storeService = getService<StoreService>("storeService")

	let map: CodeMapNode

	beforeEach(() => {
		restartSystem()
		rebuildController()

		mapTreeViewController["_viewModel"].rootNode = map
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.mapTreeView")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
		storeService = getService<StoreService>("storeService")

		map = decorateFiles()[0].map
	}

	function rebuildController() {
		mapTreeViewController = new MapTreeViewController($rootScope, $timeout, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to CodeMapPreRenderService", () => {
			CodeMapPreRenderService.subscribe = jest.fn()

			rebuildController()

			expect(CodeMapPreRenderService.subscribe).toHaveBeenCalledWith($rootScope, mapTreeViewController)
		})

		it("should subscribe to SortingOptionService", () => {
			SortingOptionService.subscribe = jest.fn()

			rebuildController()

			expect(SortingOptionService.subscribe).toHaveBeenCalledWith($rootScope, mapTreeViewController)
		})
		it("should subscribe to SortingOrderAscendingService", () => {
			SortingOrderAscendingService.subscribe = jest.fn()

			rebuildController()

			expect(SortingOrderAscendingService.subscribe).toHaveBeenCalledWith($rootScope, mapTreeViewController)
		})
	})

	describe("onSortingOrderAscendingChanged", () => {
		it("should reverse the sorting order", () => {
			mapTreeViewController.onSortingOrderAscendingChanged()

			expect(mapTreeViewController["_viewModel"].rootNode).toMatchSnapshot()
		})
	})

	describe("onSortingOptionChanged", () => {
		it("should sort folder structure according to number of files", () => {
			const sortingOption = SortingOption.NUMBER_OF_FILES

			mapTreeViewController.onSortingOptionChanged(sortingOption)

			expect(mapTreeViewController["_viewModel"].rootNode).toMatchSnapshot()
		})

		it("should sort folder structure according to name", () => {
			const sortingOption = SortingOption.NAME

			mapTreeViewController.onSortingOptionChanged(sortingOption)

			expect(mapTreeViewController["_viewModel"].rootNode).toMatchSnapshot()
		})

		it("should sort folder structure according to name accounting for numbers", () => {
			const sortingOption = SortingOption.NAME
			mapTreeViewController["_viewModel"].rootNode = VALID_NODE_NUMBERS_AND_DIACTRIC_CHARACHTERS

			mapTreeViewController.onSortingOptionChanged(sortingOption)

			expect(mapTreeViewController["_viewModel"].rootNode).toEqual(VALID_NODE_NUMBERS_AND_DIACTRIC_CHARACHTERS_SORTED)
		})
	})

	describe("onRenderMapChanged", () => {
		it("should update viewModel.rootNode after timeout and sort", () => {
			mapTreeViewController["_viewModel"].rootNode = null

			mapTreeViewController.onRenderMapChanged(map)
			$timeout.flush(100)

			expect(mapTreeViewController["_viewModel"].rootNode).toMatchSnapshot()
		})

		it("should clone new map before updating viewModel.rootNode to prevent unwanted changes in original map", () => {
			const testNode = VALID_NODE_WITH_MULTIPLE_FOLDERS
			const untouchedOriginalTestNode = klona(testNode)

			mapTreeViewController["_viewModel"].rootNode = null

			mapTreeViewController.onRenderMapChanged(testNode)
			$timeout.flush(100)

			// Be sure, sorting will be applied and the viewModel.rootNode will be modified.
			mapTreeViewController.onSortingOptionChanged(SortingOption.NUMBER_OF_FILES)

			// The sort function will change the original (referenced) map object, if it is not cloned before.
			// Check that this is not the case to prevent future side effects.
			expect(testNode).toEqual(untouchedOriginalTestNode)

			// And now check that the sort function has changed the local map copy
			// and the new order has been applied correctly.
			expect(mapTreeViewController["_viewModel"].rootNode).toEqual(VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_UNARY)
		})
	})
})
