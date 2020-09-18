import { VALID_NODE_WITH_MERGED_FOLDERS_AND_PATH, VALID_NODE_WITH_PATH } from "./dataMocks"
import { CodeMapNode } from "../codeCharta.model"
import { MapBuilder } from "./mapBuilder"
import { clone } from "./clone"

describe("mapBuilder", () => {
	let rootNode: CodeMapNode

	beforeEach(() => {
		rootNode = clone(VALID_NODE_WITH_PATH)
	})

	function buildHashMap(rootNode: CodeMapNode): Map<string, CodeMapNode> {
		return new Map([
			[rootNode.path, rootNode],
			[rootNode.children[0].path, rootNode.children[0]],
			[rootNode.children[1].path, rootNode.children[1]],
			[rootNode.children[1].children[0].path, rootNode.children[1].children[0]],
			[rootNode.children[1].children[1].path, rootNode.children[1].children[1]],
			[rootNode.children[1].children[2].path, rootNode.children[1].children[2]]
		])
	}

	describe("createCodeMapFromHashMap", () => {
		it("should create a valid delta map", () => {
			const hashMap = buildHashMap(rootNode)

			expect(MapBuilder.createCodeMapFromHashMap(hashMap)).toMatchSnapshot()
		})

		it("should create a valid delta map with empty folders in between", () => {
			rootNode = clone(VALID_NODE_WITH_MERGED_FOLDERS_AND_PATH)
			const hashMap = buildHashMap(rootNode)

			expect(MapBuilder.createCodeMapFromHashMap(hashMap)).toMatchSnapshot()
		})
	})
})
