import { CodeMapHelper } from "./codeMapHelper"
import { CodeMapNode, NodeType } from "../codeCharta.model"
import { instantiateModule } from "../../../mocks/ng.mockhelper"
import { TEST_FILE_WITH_PATHS } from "./dataMocks"
import { clone } from "./clone"
import { hierarchy } from "d3-hierarchy"

describe("codeMapHelper", () => {
	let testRoot: CodeMapNode

	beforeEach(() => {
		instantiateModule("app.codeCharta.ui.codeMap")

		testRoot = clone(TEST_FILE_WITH_PATHS.map)
	})

	describe("getCodeMapNodeFromPath", () => {
		it("should return the root if path matches path of root", () => {
			const expected = testRoot

			const result = CodeMapHelper.getCodeMapNodeFromPath(expected.path, NodeType.FOLDER, testRoot)

			expect(result).toEqual(expected)
		})

		it("should return the node that matches path and type", () => {
			const [, expected] = testRoot.children

			const result = CodeMapHelper.getCodeMapNodeFromPath(expected.path, NodeType.FOLDER, testRoot)

			expect(result).toEqual(expected)
		})

		it("should return undefined if no node matches path and type", () => {
			const result = CodeMapHelper.getCodeMapNodeFromPath(`${testRoot.path}/UNKNOWN_NODE`, NodeType.FOLDER, testRoot)

			expect(result).toBeUndefined()
		})

		it("should return undefined if a node only matches path", () => {
			const [, expected] = testRoot.children

			expect(expected.type).toEqual(NodeType.FOLDER)

			const result = CodeMapHelper.getCodeMapNodeFromPath(expected.path, NodeType.FILE, testRoot)

			expect(result).toBeUndefined()
		})
	})

	describe("getAnyCodeMapNodeFromPath", () => {
		it("should return the node that matches the path exactly", () => {
			const [expected] = testRoot.children
			const result = CodeMapHelper.getAnyCodeMapNodeFromPath(expected.path, testRoot)

			expect(result).toEqual(expected)
		})
	})

	describe("transformPath", () => {
		it("should remove / from path", () => {
			const result = CodeMapHelper.transformPath("/root")

			expect(result).toBe("root")
		})

		it("should remove ./ from path and return path", () => {
			const result = CodeMapHelper.transformPath("./root/Big Leaf")

			expect(result).toBe("root/Big Leaf")
		})
	})

	describe("getNodesByGitignorePath", () => {
		it("should return the ignored leaf if any parent folder is provided", () => {
			const expected = testRoot.children[1].children[1]

			const result = CodeMapHelper.getNodesByGitignorePath(testRoot, expected.path)

			expect(result).toEqual([expected])
		})

		it("should return an empty array if no direct children are found with path", () => {
			const result = CodeMapHelper.getNodesByGitignorePath(testRoot, `${testRoot.children[1].path}_UNKNOWN_`)

			expect(result).toEqual([])
		})

		it("should return all children if root is ignored", () => {
			const result = CodeMapHelper.getNodesByGitignorePath(testRoot, testRoot.path).map((entry) => entry.path)
			const set = new Set(result)
			expect(result.length).toEqual(set.size)
			for (const { data } of hierarchy(testRoot)) {
				expect(set.has(data.path)).toBeTruthy()
			}
		})

		it("should return all children of subfolder if root/subfolder is ignored", () => {
			const node = testRoot.children[1]
			const result = CodeMapHelper.getNodesByGitignorePath(testRoot, node.path).map((entry) => entry.path)
			const set = new Set(result)
			expect(result.length).toEqual(set.size)
			for (const { data } of hierarchy(node)) {
				expect(set.has(data.path)).toBeTruthy()
			}
		})
	})

	describe("numberOfBlacklistedNodes", () => {
		it("should return 0 if no node is blacklisted", () => {
			const result = CodeMapHelper.numberOfBlacklistedNodes(testRoot.children)

			expect(result).toBe(0)
		})

		it("should return 1 if only one node is blacklisted and provided for nodes", () => {
			testRoot.isExcluded = true

			const result = CodeMapHelper.numberOfBlacklistedNodes([testRoot])

			expect(result).toBe(1)
		})

		it("should return 1 if only one sub-node is blacklisted and but root and sub-node are provided for nodes", () => {
			testRoot.children[0].isExcluded = true

			const result = CodeMapHelper.numberOfBlacklistedNodes([testRoot, testRoot.children[0]])

			expect(result).toBe(1)
		})
	})

	describe("getMarkingColor", () => {
		it("should return undefined if no markedPackages are provided", () => {
			const result = CodeMapHelper.getMarkingColor(testRoot, null)

			expect(result).toBeUndefined()
		})

		it("should return undefined if no node does not exist in markedPackages", () => {
			const result = CodeMapHelper.getMarkingColor(testRoot, [])

			expect(result).toBeUndefined()
		})

		it("should return node color if node exists in markedPackages", () => {
			const markedPackages = [{ path: testRoot.path, color: "0x000000" }]

			const result = CodeMapHelper.getMarkingColor(testRoot, markedPackages)

			expect(result).toBe(markedPackages[0].color)
		})

		it("should return sorted sub-node color if sub-nodes exist in markedPackages", () => {
			const markedPackages = [
				{ path: testRoot.path, color: "0x000000" },
				{ path: testRoot.children[0].path, color: "0x000002" },
				{ path: testRoot.children[1].path, color: "0x000001" },
			]

			const result = CodeMapHelper.getMarkingColor(testRoot.children[0], markedPackages)

			expect(result).toBe(markedPackages[1].color)
		})
	})
})
