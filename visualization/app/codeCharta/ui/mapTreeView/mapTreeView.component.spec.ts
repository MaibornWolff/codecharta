import "./mapTreeView.module"
import { MapTreeViewController } from "./mapTreeView.component"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { CodeMapNode } from "../../codeCharta.model"
import {
	VALID_NODE_WITH_MULTIPLE_FOLDERS,
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
		it("should sort by unary", () => {
			let validNodeSorted = VALID_NODE_WITH_MULTIPLE_FOLDERS
			let sortedNode = VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_UNARY
			let compareFn = (a, b) => b.attributes["unary"] - a.attributes["unary"]
			let result = mapTreeViewController.applySortOrderChange(validNodeSorted, compareFn, false)
			expect(result).toEqual(sortedNode)
		})

		it("should sort by name", () => {
			let validNodeSorted = VALID_NODE_WITH_MULTIPLE_FOLDERS
			let sortedNode = VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_NAME
			let compareFn = (a, b) => (b.name > a.name ? 1 : 0)
			let result = mapTreeViewController.applySortOrderChange(validNodeSorted, compareFn, false)
			console.log(result)
			expect(result).toEqual(sortedNode)
		})
	})

	describe("onSortingOrderAscendingChanged", () => {
		it("", () => {})
	})

	describe("onSortingDialogOptionChanged", () => {
		it("", () => {})
	})

	describe("applySort", () => {
		it("", () => {})
	})

	/*	it("should sort folder", () => {
			mapTreeViewLevelController["node"] = CodeMapHelper.getCodeMapNodeFromPath(
				"/root/Parent Leaf",
				NodeType.FOLDER,
				VALID_NODE_WITH_PATH
			)

			const result = mapTreeViewLevelController.sortByFolder(mapTreeViewLevelController["node"])

			expect(result).toBe(1)
		})

*/

	describe("onRenderMapChanged", () => {
		it("should update viewModel.rootNode after timeout", () => {
			mapTreeViewController["_viewModel"] = { rootNode: null }
			mapTreeViewController["onRenderMapChanged"](map)

			//mapTreeViewController.onRenderMapChanged(map)
			$timeout.flush(100)

			expect(mapTreeViewController["_viewModel"].rootNode).toBe(map)
		})
	})
	describe("onSortingDialogOptionChanged", () => {
		it("should sort the nodes according to name, splitting into Folders and Files while preserving tree structure", () => {})
	})
})
