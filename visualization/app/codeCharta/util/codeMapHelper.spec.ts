import { CodeMapHelper } from "./codeMapHelper"
import { CodeMapNode, MarkedPackage, NodeType } from "../codeCharta.model"
import { instantiateModule } from "../../../mocks/ng.mockhelper"
import { TEST_FILE_WITH_PATHS } from "./dataMocks"
import { clone } from "./clone"

describe("codeMapHelper", () => {
	let testRoot: CodeMapNode

	beforeEach(() => {
		instantiateModule("app.codeCharta.ui.codeMap")

		testRoot = clone(TEST_FILE_WITH_PATHS.map)
	})

	describe("getCodeMapNodeFromPath", () => {
		it("should return the root if path matches path of root", () => {
			const expected = testRoot

			const result = CodeMapHelper.getCodeMapNodeFromPath("/root", NodeType.FOLDER, testRoot)

			expect(result).toEqual(expected)
		})

		it("should return the node that matches path and type", () => {
			const [, expected] = testRoot.children

			const result = CodeMapHelper.getCodeMapNodeFromPath("/root/Parent Leaf", NodeType.FOLDER, testRoot)

			expect(result).toEqual(expected)
		})

		it("should return undefined if no node matches path and type", () => {
			const result = CodeMapHelper.getCodeMapNodeFromPath("/root/Uncle Leaf", NodeType.FOLDER, testRoot)

			expect(result).toBeUndefined()
		})

		it("should return undefined if a node only matches path", () => {
			const result = CodeMapHelper.getCodeMapNodeFromPath("/root/Parent Leaf", NodeType.FILE, testRoot)

			expect(result).toBeUndefined()
		})
	})

	describe("getAnyCodeMapNodeFromPath", () => {
		it("should return the node that matches the path exactly", () => {
			const result = CodeMapHelper.getAnyCodeMapNodeFromPath("/root/big leaf", testRoot)

			expect(result).toEqual(testRoot.children[0])
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
		it("should return the ignored leaf if parent folder is provided", () => {
			const expected = [testRoot.children[1].children[1]]

			const result = CodeMapHelper.getNodesByGitignorePath(testRoot.children[1], "/root/Parent Leaf/other small leaf")

			expect(result).toEqual(expected)
		})

		it("should return an empty array if no direct children are found with path", () => {
			const result = CodeMapHelper.getNodesByGitignorePath(testRoot, "/root/Parent Leaf/other small leaf")

			expect(result).toEqual([])
		})

		it("should return all children if root is ignored", () => {
			const expected = testRoot.children

			const result = CodeMapHelper.getNodesByGitignorePath(testRoot, "/root")

			expect(result).toEqual(expected)
		})

		it("should return all children of subfolder if root/subfolder is ignored", () => {
			const expected = [testRoot.children[1]]

			const result = CodeMapHelper.getNodesByGitignorePath(testRoot, "/root/Parent Leaf")

			expect(result).toEqual(expected)
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
		let markedPackages: MarkedPackage[]

		beforeEach(() => {
			markedPackages = []
		})

		function addRootToMarkedPackages() {
			markedPackages.push({ path: "/root", color: "0x000000" })
		}

		function addSubNodesToMarkedPackages() {
			markedPackages.push({ path: "/root/Parent Leaf", color: "0x000001" })
			markedPackages.push({ path: "/root/big leaf", color: "0x000002" })
		}

		it("should return undefined if no markedPackages are provided", () => {
			const result = CodeMapHelper.getMarkingColor(testRoot, null)

			expect(result).toBeUndefined()
		})

		it("should return undefined if no node does not exist in markedPackages", () => {
			const result = CodeMapHelper.getMarkingColor(testRoot, markedPackages)

			expect(result).toBeUndefined()
		})

		it("should return node color if node exists in markedPackages", () => {
			addRootToMarkedPackages()
			const expected = "0x000000"

			const result = CodeMapHelper.getMarkingColor(testRoot, markedPackages)

			expect(result).toBe(expected)
		})

		it("should return sorted sub-node color if sub-nodes exist in markedPackages", () => {
			addRootToMarkedPackages()
			addSubNodesToMarkedPackages()

			const expected = "0x000002"

			const result = CodeMapHelper.getMarkingColor(testRoot.children[0], markedPackages)

			expect(result).toBe(expected)
		})
	})
})
