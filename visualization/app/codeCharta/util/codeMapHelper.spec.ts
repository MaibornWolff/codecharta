import { CodeMapHelper } from "./codeMapHelper"
import { BlacklistItem, BlacklistType, CodeMapNode, MarkedPackage, NodeType } from "../codeCharta.model"
import { instantiateModule } from "../../../mocks/ng.mockhelper"
import { TEST_FILE_WITH_PATHS } from "./dataMocks"

describe("codeMapHelper", () => {
	let testRoot: CodeMapNode
	let blacklist: BlacklistItem[]

	beforeEach(() => {
		restartSystem()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		testRoot = JSON.parse(JSON.stringify(TEST_FILE_WITH_PATHS.map))
	}

	function addRootToBlacklist() {
		blacklist.push({ path: testRoot.path, type: BlacklistType.exclude })
		testRoot.isBlacklisted = BlacklistType.exclude
	}

	function addSubNodeToBlacklist() {
		blacklist.push({ path: testRoot.children[0].path, type: BlacklistType.exclude })
		testRoot.children[0].isBlacklisted = BlacklistType.exclude
	}

	describe("getCodeMapNodeFromPath", () => {
		it("should return the root if path matches path of root", () => {
			const expected = testRoot

			const result = CodeMapHelper.getCodeMapNodeFromPath("/root", NodeType.FOLDER, testRoot)

			expect(result).toEqual(expected)
		})

		it("should return the node that matches path and type", () => {
			const expected = testRoot.children[1]

			const result = CodeMapHelper.getCodeMapNodeFromPath("/root/Parent Leaf", NodeType.FOLDER, testRoot)

			expect(result).toEqual(expected)
		})

		it("should return null if no node matches path and type", () => {
			const result = CodeMapHelper.getCodeMapNodeFromPath("/root/Uncle Leaf", NodeType.FOLDER, testRoot)

			expect(result).toBeNull()
		})

		it("should return null if a node only matches path", () => {
			const result = CodeMapHelper.getCodeMapNodeFromPath("/root/Parent Leaf", NodeType.FILE, testRoot)

			expect(result).toBeNull()
		})
	})

	describe("getAnyCodeMapNodeFromPath", () => {
		it("should call getCodeMapNodeFromPath with type File at the beginning of call", () => {
			CodeMapHelper.getCodeMapNodeFromPath = jest.fn()

			CodeMapHelper.getAnyCodeMapNodeFromPath("/root", testRoot)

			expect(CodeMapHelper.getCodeMapNodeFromPath).toHaveBeenCalledWith("/root", NodeType.FILE, testRoot)
		})

		it("should call getCodeMapNodeFromPath with type Folder when no file was found and return null", () => {
			CodeMapHelper.getCodeMapNodeFromPath = jest.fn().mockReturnValue(null)

			const result = CodeMapHelper.getAnyCodeMapNodeFromPath("/root", testRoot)

			expect(CodeMapHelper.getCodeMapNodeFromPath).toHaveBeenCalledWith("/root", NodeType.FOLDER, testRoot)
			expect(result).toBeNull()
		})

		it("should return the first file found by getCodeMapNodeFromPath", () => {
			CodeMapHelper.getCodeMapNodeFromPath = jest.fn().mockReturnValue(testRoot)

			const result = CodeMapHelper.getAnyCodeMapNodeFromPath("/root", testRoot)

			expect(result).toEqual(testRoot)
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

			const result = CodeMapHelper.getNodesByGitignorePath(testRoot.children[1].children, "/root/Parent Leaf/other small leaf")

			expect(result).toEqual(expected)
		})

		it("should return an empty array if no direct children are found with path", () => {
			const result = CodeMapHelper.getNodesByGitignorePath(testRoot.children, "/root/Parent Leaf/other small leaf")

			expect(result).toEqual([])
		})

		it("should return all children if root is ignored", () => {
			const expected = testRoot.children

			const result = CodeMapHelper.getNodesByGitignorePath(testRoot.children, "/root")

			expect(result).toEqual(expected)
		})

		it("should return all children of subfolder if root/subfolder is ignored", () => {
			const expected = [testRoot.children[1]]

			const result = CodeMapHelper.getNodesByGitignorePath(testRoot.children, "/root/Parent Leaf")

			expect(result).toEqual(expected)
		})
	})

	describe("numberOfBlacklistedNodes", () => {
		it("should return 0 if no node is blacklisted", () => {
			const result = CodeMapHelper.numberOfBlacklistedNodes(testRoot.children)

			expect(result).toBe(0)
		})

		it("should return 1 if only one node is blacklisted and provided for nodes", () => {
			addRootToBlacklist()

			const result = CodeMapHelper.numberOfBlacklistedNodes([testRoot])

			expect(result).toBe(1)
		})

		it("should return 1 if only one sub-node is blacklisted and but root and sub-node are provided for nodes", () => {
			addSubNodeToBlacklist()

			const result = CodeMapHelper.numberOfBlacklistedNodes([testRoot, testRoot.children[0]])

			expect(result).toBe(1)
		})
	})

	describe("isBlacklisted", () => {
		it("should return false if node is not blacklisted", () => {
			const result = CodeMapHelper.isBlacklisted(testRoot, BlacklistType.exclude)

			expect(result).toBeFalsy()
		})

		it("should return false if node exists in blacklist, but does not match BlacklistType", () => {
			addRootToBlacklist()

			const result = CodeMapHelper.isBlacklisted(testRoot, BlacklistType.flatten)

			expect(result).toBeFalsy()
		})

		it("should return true if node exists in blacklist and matches BlacklistType", () => {
			addRootToBlacklist()

			const result = CodeMapHelper.isBlacklisted(testRoot, BlacklistType.exclude)

			expect(result).toBeTruthy()
		})

		it("should return true if node exists in blacklist and sub-node is provided as node", () => {
			addRootToBlacklist()
			addSubNodeToBlacklist()

			const result = CodeMapHelper.isBlacklisted(testRoot.children[0], BlacklistType.exclude)

			expect(result).toBeTruthy()
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

		it("should return null if no markedPackages are provided", () => {
			const result = CodeMapHelper.getMarkingColor(testRoot, null)

			expect(result).toBeNull()
		})

		it("should return null if no node does not exist in markedPackages", () => {
			const result = CodeMapHelper.getMarkingColor(testRoot, markedPackages)

			expect(result).toBeNull()
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
