import "./codeMap.module"
import "../../codeCharta"
import { CodeMapUtilService } from "./codeMap.util.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { BlacklistItem, BlacklistType, CodeMapNode, MarkedPackage } from "../../codeCharta.model"
import { TEST_FILE_WITH_PATHS } from "../../util/dataMocks"
import * as path from "path"

describe("codeMapUtilService", () => {

    let codeMapUtilService: CodeMapUtilService;
    let testRoot: CodeMapNode
    let blacklist : BlacklistItem[]

    beforeEach(() => {
        restartSystem()
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.codeMap")

        codeMapUtilService = getService<CodeMapUtilService>("codeMapUtilService")
        testRoot = JSON.parse(JSON.stringify(TEST_FILE_WITH_PATHS.map))
    }

    function addRootToBlacklist() {
        blacklist.push({path: testRoot.path, type : BlacklistType.exclude})
    }

    function addSubNodeToBlacklist() {
        blacklist.push({path: testRoot.children[0].path, type : BlacklistType.exclude})
    }

    describe("getAnyCodeMapNodeFromPath", () => {
        it("should call getCodeMapNodeFromPath with type File at the beginning of call", () => {
            codeMapUtilService.getCodeMapNodeFromPath = jest.fn()

            codeMapUtilService.getAnyCodeMapNodeFromPath("/root", testRoot)

            expect(codeMapUtilService.getCodeMapNodeFromPath).toHaveBeenCalledWith("/root", "File", testRoot)
        })

        it("should call getCodeMapNodeFromPath with type Folder when no file was found and return null", () => {
            codeMapUtilService.getCodeMapNodeFromPath = jest.fn().mockReturnValue(null)

            const result = codeMapUtilService.getAnyCodeMapNodeFromPath("/root", testRoot)

            expect(codeMapUtilService.getCodeMapNodeFromPath).toHaveBeenCalledWith("/root", "Folder", testRoot)
            expect(result).toBeNull()
        })

        it("should return the first file found by getCodeMapNodeFromPath", () => {
            codeMapUtilService.getCodeMapNodeFromPath = jest.fn().mockReturnValue(testRoot)

            const result = codeMapUtilService.getAnyCodeMapNodeFromPath("/root", testRoot)

            expect(result).toEqual(testRoot)
        })
    })

    describe("getCodeMapNodeFromPath", () => {
        it("should return the root if path matches path of root", () => {
            const expected = testRoot

            const result = codeMapUtilService.getCodeMapNodeFromPath("/root", "Folder", testRoot)

            expect(result).toEqual(expected)
        })

        it("should return the node that matches path and type", () => {
            const expected = testRoot.children[1]

            const result = codeMapUtilService.getCodeMapNodeFromPath("/root/Parent Leaf", "Folder", testRoot)

            expect(result).toEqual(expected)
        })

        it("should return null if no node matches path and type", () => {
            const result = codeMapUtilService.getCodeMapNodeFromPath("/root/Uncle Leaf", "Folder", testRoot)

            expect(result).toBeNull()
        })

        it("should return null if a node only matches path", () => {
            const result = codeMapUtilService.getCodeMapNodeFromPath("/root/Parent Leaf", "File", testRoot)

            expect(result).toBeNull()
        })
    })

    describe("transformPath", () => {
        it("should remove / from path", () => {
            const result = CodeMapUtilService.transformPath("/root")

            expect(result).toBe("root")
        })

        it("should remove ./ from path and return path", () => {
            const result = CodeMapUtilService.transformPath("./root/Big Leaf")

            expect(result).toBe(path.relative("/", "root/Big Leaf"))
        })
    })

    describe("getNodesByGitignorePath", () => {
        it("should return the ignored leaf if parent folder is provided", () => {
            const expected = [testRoot.children[1].children[1]]

            const result = CodeMapUtilService.getNodesByGitignorePath(testRoot.children[1].children, "/root/Parent Leaf/other small leaf")

            expect(result).toEqual(expected)
        })

        it("should return an empty array if no direct children are found with path", () => {
            const result = CodeMapUtilService.getNodesByGitignorePath(testRoot.children, "/root/Parent Leaf/other small leaf")

            expect(result).toEqual([])
        })

        it("should return all children if root is ignored", () => {
            const expected = testRoot.children

            const result = CodeMapUtilService.getNodesByGitignorePath(testRoot.children, "/root")

            expect(result).toEqual(expected)
        })

        it("should return all children of subfolder if root/subfolder is ignored", () => {
            const expected = [testRoot.children[1]]

            const result = CodeMapUtilService.getNodesByGitignorePath(testRoot.children, "/root/Parent Leaf")

            expect(result).toEqual(expected)
        })
    })

    describe("numberOfBlacklistedNodes", () => {
        beforeEach(() => {
            blacklist = []
        })

        it("should return 0 if no blacklist is provided", () => {
            const result = CodeMapUtilService.numberOfBlacklistedNodes(testRoot.children, null)

            expect(result).toBe(0)
        })

        it("should return 0 if empty blacklist is provided", () => {
            const result = CodeMapUtilService.numberOfBlacklistedNodes(testRoot.children, blacklist)

            expect(result).toBe(0)
        })

        it("should return 1 if only one node is blacklisted and provided for nodes", () => {
            addRootToBlacklist()

            const result = CodeMapUtilService.numberOfBlacklistedNodes([testRoot], blacklist)

            expect(result).toBe(1)
        })

        it("should return 1 if only one sub-node is blacklisted and but root and sub-node are provided for nodes", () => {
            addSubNodeToBlacklist()

            const result = CodeMapUtilService.numberOfBlacklistedNodes([testRoot, testRoot.children[0]], blacklist)

            expect(result).toBe(1)
        })
    })

    describe("isBlacklisted", () => {
        beforeEach(() => {
            blacklist = []
        })

        it("should return false if blacklist is empty", () => {
            const result = CodeMapUtilService.isBlacklisted(testRoot, blacklist, BlacklistType.exclude)

            expect(result).toBeFalsy()
        })

        it("should return false if node does not exist in blacklist", () => {
            addSubNodeToBlacklist()

            const result = CodeMapUtilService.isBlacklisted(testRoot, blacklist, BlacklistType.exclude)

            expect(result).toBeFalsy()
        })

        it("should return false if node exists in blacklist, but does not match BlacklistType", () => {
            addRootToBlacklist()

            const result = CodeMapUtilService.isBlacklisted(testRoot, blacklist, BlacklistType.hide)

            expect(result).toBeFalsy()
        })

        it("should return true if node exists in blacklist and matches BlacklistType", () => {
            addRootToBlacklist()

            const result = CodeMapUtilService.isBlacklisted(testRoot, blacklist, BlacklistType.exclude)

            expect(result).toBeTruthy()
        })

        it("should return true if node exists in blacklist and sub-node is provided as node", () => {
            addRootToBlacklist()

            const result = CodeMapUtilService.isBlacklisted(testRoot.children[0], blacklist, BlacklistType.exclude)

            expect(result).toBeTruthy()
        })
    })

    describe("getMarkingColor", () => {
        let markedPackages : MarkedPackage[]

        beforeEach(() => {
            markedPackages = []
        })

        function addRootToMarkedPackages() {
            markedPackages.push({path: "/root", color: "0x000000", attributes: {}})
        }

        function addSubNodesToMarkedPackages() {
            markedPackages.push({path: "/root/Parent Leaf", color: "0x000001", attributes: {}})
            markedPackages.push({path: "/root/big leaf", color: "0x000002", attributes: {}})
        }

        it("should return null if no markedPackages are provided", () => {
            const result = CodeMapUtilService.getMarkingColor(testRoot, null)

            expect(result).toBeNull()
        })

        it("should return null if no node does not exist in markedPackages", () => {
            const result = CodeMapUtilService.getMarkingColor(testRoot, markedPackages)

            expect(result).toBeNull()
        })

        it("should return node color if node exists in markedPackages", () => {
            addRootToMarkedPackages()
            const expected = "0x000000"

            const result = CodeMapUtilService.getMarkingColor(testRoot, markedPackages)

            expect(result).toBe(expected)
        })

        it("should return sorted sub-node color if sub-nodes exist in markedPackages", () => {
            addRootToMarkedPackages()
            addSubNodesToMarkedPackages()

            const expected = "0x000002"

            const result = CodeMapUtilService.getMarkingColor(testRoot.children[0], markedPackages)

            expect(result).toBe(expected)
        })
    })
});