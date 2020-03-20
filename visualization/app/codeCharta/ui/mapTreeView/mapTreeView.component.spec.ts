import "./mapTreeView.module"
import { MapTreeViewController } from "./mapTreeView.component"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { CodeMapNode, SortingOption } from "../../codeCharta.model"
import {
	VALID_NODE_WITH_MULTIPLE_FOLDERS,
	VALID_NODE_WITH_MULTIPLE_FOLDERS_REVERSED,
	VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_NAME,
	VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_UNARY,
	VALID_NODE_WITH_PATH
} from "../../util/dataMocks"
import _ from "lodash"
import { StoreService } from "../../state/store.service"
import { SortingDialogOptionService } from "../../state/store/dynamicSettings/sortingDialogOption/sortingDialogOption.service"
import { SortingOrderAscendingService } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.service"

describe("MapTreeViewController", () => {
	let mapTreeViewController: MapTreeViewController
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let storeService = getService<StoreService>("storeService")
	let map: CodeMapNode
	let validSetupNode: CodeMapNode

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.mapTreeView")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
		storeService = getService<StoreService>("storeService")

		map = _.cloneDeep(VALID_NODE_WITH_PATH)
		validSetupNode = _.cloneDeep(VALID_NODE_WITH_MULTIPLE_FOLDERS)
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

		it("should subscribe to SortingDialogOptionService", () => {
			SortingDialogOptionService.subscribe = jest.fn()

			rebuildController()

			expect(SortingDialogOptionService.subscribe).toHaveBeenCalledWith($rootScope, mapTreeViewController)
		})
		it("should subscribe to SortingOrderAscendingService", () => {
			SortingOrderAscendingService.subscribe = jest.fn()

			rebuildController()

			expect(SortingOrderAscendingService.subscribe).toHaveBeenCalledWith($rootScope, mapTreeViewController)
		})
	})

	describe("applySort", () => {
		it("should return the children array sorted by unary", () => {
			let sortedNode = VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_UNARY
			let compareFn = (a, b) => b.attributes["unary"] - a.attributes["unary"]
			let result = mapTreeViewController.applySort(validSetupNode, compareFn)
			expect(result).toEqual(sortedNode.children)
		})
	})

	describe("applySortOrderChange", () => {
		it("should sort by unary", () => {
			let sortedNode = VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_UNARY
			let compareFn = (a, b) => b.attributes["unary"] - a.attributes["unary"]
			let result = mapTreeViewController.applySortOrderChange(validSetupNode, compareFn, false)
			expect(result).toEqual(sortedNode)
		})

		it("should sort by name", () => {
			let sortedNode = VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_NAME
			let compareFn = (a, b) => (b.name > a.name ? 1 : 0)
			let result = mapTreeViewController.applySortOrderChange(validSetupNode, compareFn, false)
			expect(result).toEqual(sortedNode)
		})

		it("should reverse order", () => {
			let sortedNode = VALID_NODE_WITH_MULTIPLE_FOLDERS_REVERSED
			let result = mapTreeViewController.applySortOrderChange(validSetupNode, null, true)
			expect(result).toEqual(sortedNode)
		})
	})

	describe("onSortingOrderAscendingChanged", () => {
		it("should reverse the sorting order", () => {
			mapTreeViewController["_viewModel"].rootNode = validSetupNode
			mapTreeViewController.onSortingOrderAscendingChanged(true)
			expect(mapTreeViewController["_viewModel"].rootNode).toEqual(VALID_NODE_WITH_MULTIPLE_FOLDERS_REVERSED)
		})
	})

	describe("onSortingDialogOptionChanged", () => {
		it("should sort folder structure according to childnode size", () => {
			let sortingDialogOption = SortingOption.Childnodes
			mapTreeViewController["_viewModel"].rootNode = validSetupNode
			mapTreeViewController.onSortingDialogOptionChanged(sortingDialogOption)
			expect(mapTreeViewController["_viewModel"].rootNode).toEqual(VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_UNARY)
		})
		it("should sort folder structure according to name", () => {
			let sortingDialogOption = SortingOption.Name
			mapTreeViewController["_viewModel"].rootNode = VALID_NODE_WITH_MULTIPLE_FOLDERS
			mapTreeViewController.onSortingDialogOptionChanged(sortingDialogOption)
			expect(mapTreeViewController["_viewModel"].rootNode).toEqual(VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_NAME)
		})
	})

	describe("onRenderMapChanged", () => {
		it("should update viewModel.rootNode after timeout", () => {
			mapTreeViewController["_viewModel"] = { rootNode: null }
			mapTreeViewController["onRenderMapChanged"](map)

			mapTreeViewController.onRenderMapChanged(map)
			$timeout.flush(100)

			expect(mapTreeViewController["_viewModel"].rootNode).toBe(map)
		})
	})
})
