import "./mapTreeView.module"
import { MapTreeViewController } from "./mapTreeView.component"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { CodeMapNode, SortingOption } from "../../codeCharta.model"
import {
	VALID_NODE_WITH_MULTIPLE_FOLDERS,
	VALID_NODE_WITH_MULTIPLE_FOLDERS_REVERSED,
	VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_NAME,
	VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_UNARY
} from "../../util/dataMocks"
import _ from "lodash"
import { StoreService } from "../../state/store.service"
import { SortingOrderAscendingService } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.service"
import { SortingOptionService } from "../../state/store/dynamicSettings/sortingOption/sortingOption.service"

describe("MapTreeViewController", () => {
	let mapTreeViewController: MapTreeViewController
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let storeService = getService<StoreService>("storeService")
	let mapWithMultipleFolders: CodeMapNode

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.mapTreeView")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
		storeService = getService<StoreService>("storeService")

		mapWithMultipleFolders = _.cloneDeep(VALID_NODE_WITH_MULTIPLE_FOLDERS)
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
			mapTreeViewController["_viewModel"].rootNode = mapWithMultipleFolders

			mapTreeViewController.onSortingOrderAscendingChanged(true)

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
	})

	describe("onRenderMapChanged", () => {
		it("should update viewModel.rootNode after timeout", () => {
			const testNode = VALID_NODE_WITH_MULTIPLE_FOLDERS

			mapTreeViewController["_viewModel"].rootNode = null

			mapTreeViewController.onRenderMapChanged(testNode)
			$timeout.flush(100)

			expect(mapTreeViewController["_viewModel"].rootNode).toEqual(VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_NAME)
		})
	})
})
