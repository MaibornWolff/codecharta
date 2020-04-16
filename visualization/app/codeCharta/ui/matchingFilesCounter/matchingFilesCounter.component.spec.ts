import "./matchingFilesCounter.module"
import { MatchingFilesCounterController } from "./matchingFilesCounter.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { VALID_NODE_WITH_PATH } from "../../util/dataMocks"
import { BlacklistType } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { NodeSearchService } from "../../state/nodeSearch.service"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { StoreService } from "../../state/store.service"
import { addBlacklistItem } from "../../state/store/fileSettings/blacklist/blacklist.actions"

describe("MatchingFilesCounterController", () => {
	let matchingFilesCounterController: MatchingFilesCounterController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.matchingFilesCounter")
		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		matchingFilesCounterController = new MatchingFilesCounterController($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to NodeSearchService", () => {
			NodeSearchService.subscribe = jest.fn()

			rebuildController()

			expect(NodeSearchService.subscribe).toHaveBeenCalledWith($rootScope, matchingFilesCounterController)
		})

		it("should subscribe to BlacklistService", () => {
			BlacklistService.subscribe = jest.fn()

			rebuildController()

			expect(BlacklistService.subscribe).toHaveBeenCalledWith($rootScope, matchingFilesCounterController)
		})
	})

	describe("updateViewModel", () => {
		let rootNode = VALID_NODE_WITH_PATH

		it("should update ViewModel count Attributes when pattern hidden and excluded", () => {
			matchingFilesCounterController["_viewModel"].searchPattern = "/root/node/path"
			matchingFilesCounterController["searchedNodeLeaves"] = [rootNode, rootNode]
			matchingFilesCounterController["searchedNodeLeaves"][0].path = matchingFilesCounterController["_viewModel"].searchPattern
			storeService.dispatch(addBlacklistItem({ path: "/root/node/path", type: BlacklistType.exclude }))
			storeService.dispatch(addBlacklistItem({ path: "/root/node/path", type: BlacklistType.flatten }))

			matchingFilesCounterController["updateViewModel"]()

			expect(matchingFilesCounterController["_viewModel"].fileCount).toEqual(2)
			expect(matchingFilesCounterController["_viewModel"].flattenCount).toEqual(2)
			expect(matchingFilesCounterController["_viewModel"].excludeCount).toEqual(2)
		})
	})

	describe("getSearchedNodeLeaves", () => {
		it("should return array of nodes leaves", () => {
			const rootNode = VALID_NODE_WITH_PATH
			const searchNodes = [
				rootNode,
				rootNode.children[0],
				rootNode.children[1].children[0],
				rootNode.children[1].children[1],
				rootNode.children[1].children[2]
			]
			const nodeLeaves = [
				rootNode.children[0],
				rootNode.children[1].children[0],
				rootNode.children[1].children[1],
				rootNode.children[1].children[2]
			]
			const result = matchingFilesCounterController["getSearchedNodeLeaves"](searchNodes)

			expect(result).toEqual(nodeLeaves)
		})
	})
})
