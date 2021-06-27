import "./mapTreeView.module"
import { MapTreeViewController } from "./mapTreeView.component"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { getService, instantiateModuleWithNgRedux } from "../../../../mocks/ng.mockhelper"
import { CodeMapNode, SortingOption } from "../../codeCharta.model"
import {
	VALID_NODE_WITH_MULTIPLE_FOLDERS,
	VALID_NODE_WITH_MULTIPLE_FOLDERS_REVERSED,
	VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_NAME,
	VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_UNARY,
	VALID_NODE_NUMBERS_AND_DIACTRIC_CHARACHTERS,
	VALID_NODE_NUMBERS_AND_DIACTRIC_CHARACHTERS_SORTED
} from "../../util/dataMocks"
import { StoreService } from "../../state/store.service"
import { SortingOptionService } from "../../state/store/dynamicSettings/sortingOption/sortingOption.service"
import { clone } from "../../util/clone"
import { klona } from "klona"
import ngRedux from "ng-redux"
import { setSortingOrderAscending } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"

describe("MapTreeViewController", () => {
	let mapTreeViewController: MapTreeViewController
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let storeService = getService<StoreService>("storeService")
	let mapWithMultipleFolders: CodeMapNode
	let $ngRedux: ngRedux.INgRedux

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		$ngRedux = instantiateModuleWithNgRedux("app.codeCharta.ui.mapTreeView")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
		storeService = getService<StoreService>("storeService")

		mapWithMultipleFolders = clone(VALID_NODE_WITH_MULTIPLE_FOLDERS)
	}

	function rebuildController() {
		mapTreeViewController = new MapTreeViewController($rootScope, $timeout, storeService, $ngRedux)
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
	})

	describe("onSortingOrderAscendingChanged", () => {
		it("should reverse the sorting order if sortingOrderAscending changes", () => {
			mapTreeViewController["_viewModel"].rootNode = mapWithMultipleFolders

			$ngRedux.dispatch(setSortingOrderAscending(true))

			expect(mapTreeViewController["_viewModel"].rootNode).toEqual(VALID_NODE_WITH_MULTIPLE_FOLDERS_REVERSED)
		})
	})

	describe("onSortingOptionChanged", () => {
		it("should sort folder structure according to number of files", () => {
			const sortingOption = SortingOption.NUMBER_OF_FILES
			mapTreeViewController["_viewModel"].rootNode = mapWithMultipleFolders

			mapTreeViewController.onSortingOptionChanged(sortingOption)

			expect(mapTreeViewController["_viewModel"].rootNode).toEqual(VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_UNARY)
		})

		it("should sort folder structure according to name", () => {
			const sortingOption = SortingOption.NAME
			mapTreeViewController["_viewModel"].rootNode = VALID_NODE_WITH_MULTIPLE_FOLDERS

			mapTreeViewController.onSortingOptionChanged(sortingOption)

			expect(mapTreeViewController["_viewModel"].rootNode).toEqual(VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_NAME)
		})

		it("should sort folder structure according to name accounting for numbers", () => {
			const sortingOption = SortingOption.NAME
			mapTreeViewController["_viewModel"].rootNode = VALID_NODE_NUMBERS_AND_DIACTRIC_CHARACHTERS

			mapTreeViewController.onSortingOptionChanged(sortingOption)

			expect(mapTreeViewController["_viewModel"].rootNode).toEqual(VALID_NODE_NUMBERS_AND_DIACTRIC_CHARACHTERS_SORTED)
		})
	})

	describe("onRenderMapChanged", () => {
		it("should update viewModel.rootNode after timeout", () => {
			const testNode = VALID_NODE_WITH_MULTIPLE_FOLDERS

			mapTreeViewController["_viewModel"].rootNode = null

			mapTreeViewController.onRenderMapChanged(testNode)
			$timeout.flush(100)

			expect(mapTreeViewController["_viewModel"].rootNode).toEqual(VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_NAME)
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
