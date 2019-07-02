import "./matchingFilesCounter.module"
import { MatchingFilesCounterController } from "./matchingFilesCounter.component"
import {instantiateModule, getService} from "../../../../mocks/ng.mockhelper"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { VALID_NODE_WITH_PATH } from "../../util/dataMocks"
import { CodeMapNode, BlacklistItem, BlacklistType } from "../../codeCharta.model";
import { CodeMapHelper } from "../../util/codeMapHelper";

describe("MatchingFilesCounterController", () => {

	let matchingFilesCounterController: MatchingFilesCounterController
	let codeMapPreRenderService: CodeMapPreRenderService

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function restartSystem() {
		instantiateModule("app.codeCharta.ui.matchingFilesCounter")
		codeMapPreRenderService = getService<CodeMapPreRenderService>("codeMapPreRenderService")
    }

    function rebuildController() {
        matchingFilesCounterController = new MatchingFilesCounterController(codeMapPreRenderService)
    }

    describe("updateViewModel", () => {
		let searchedNodeLeaves: CodeMapNode[]
		let rootNode = VALID_NODE_WITH_PATH

		it("should update ViewModel count Attributes when pattern hidden and excluded", () => {
			matchingFilesCounterController["_viewModel"].searchPattern = "/root/node/path"

			searchedNodeLeaves = [rootNode, rootNode]
			searchedNodeLeaves[0].path = matchingFilesCounterController["_viewModel"].searchPattern
			const blacklist: BlacklistItem[] = [
				{ path: "/root/node/path", type: BlacklistType.exclude },
				{ path: "/root/node/path", type: BlacklistType.hide }
			]

			// On Windows 'ignore' generates paths with backslashes instead of slashes when executing
			// the unit tests, and thus the test case fails without this mock.
			CodeMapHelper.isBlacklisted = jest.fn((node, blacklist, type) => {
				return (
					(type == BlacklistType.hide && node.path == "/root/node/path") ||
					(type == BlacklistType.exclude && node.path == "/root/node/path")
				)
			})

			matchingFilesCounterController["updateViewModel"](searchedNodeLeaves, blacklist, "/root/node/path")

			expect(matchingFilesCounterController["_viewModel"].fileCount).toEqual(searchedNodeLeaves.length)
			expect(matchingFilesCounterController["_viewModel"].hideCount).toEqual(2)
			expect(matchingFilesCounterController["_viewModel"].excludeCount).toEqual(2)
		})
	})

	describe("getSearchedNodeLeaves", () => {
		it("should return array of nodes leaves", () => {
			const rootNode = VALID_NODE_WITH_PATH
			matchingFilesCounterController["searchedNodes"] = [
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
			const result = matchingFilesCounterController["getSearchedNodeLeaves"]()

			expect(result).toEqual(nodeLeaves)
		})
	})

});