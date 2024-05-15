import { TEST_FILE_WITH_PATHS } from "../../../util/dataMocks"
import { getNodesByGitignorePath } from "./getNodesByGitignorePath"

describe("getNodesByGitignorePath", () => {
    it("should retrieve no nodes for an empty search", () => {
        const searchedNodes = getNodesByGitignorePath(TEST_FILE_WITH_PATHS.map, "")

        expect(searchedNodes.length).toBe(0)
    })

    it("should retrieve no nodes if searched within nothing", () => {
        const searchedNodes = getNodesByGitignorePath(undefined, "")

        expect(searchedNodes.length).toBe(0)
    })

    it("should find nodes based on a wildcard search", () => {
        const searchedNodes = getNodesByGitignorePath(TEST_FILE_WITH_PATHS.map, "*small*")

        expect(searchedNodes.length).toBe(2)
        expect(searchedNodes[0].path).toBe("/root/Parent Leaf/small leaf")
        expect(searchedNodes[1].path).toBe("/root/Parent Leaf/other small leaf")
    })

    it("should find nodes based on string search", () => {
        const searchedNodes = getNodesByGitignorePath(TEST_FILE_WITH_PATHS.map, "small")

        expect(searchedNodes.length).toBe(2)
        expect(searchedNodes[0].path).toBe("/root/Parent Leaf/small leaf")
        expect(searchedNodes[1].path).toBe("/root/Parent Leaf/other small leaf")
    })

    it("should find no nodes based on prefix search with non existing prefix", () => {
        const searchedNodes = getNodesByGitignorePath(TEST_FILE_WITH_PATHS.map, "oot/*")

        expect(searchedNodes.length).toBe(0)
    })

    it("should find all nodes based on prefix search with prefix of root node", () => {
        const searchedNodes = getNodesByGitignorePath(TEST_FILE_WITH_PATHS.map, "root*")

        expect(searchedNodes.length).toBe(6)
    })

    it("should find nodes based on exact match", () => {
        const searchedNodes = getNodesByGitignorePath(TEST_FILE_WITH_PATHS.map, '"/root/Parent Leaf"')

        expect(searchedNodes.length).toBe(4)
        expect(searchedNodes[0].path).toBe("/root/Parent Leaf")
        expect(searchedNodes[1].path).toBe("/root/Parent Leaf/small leaf")
        expect(searchedNodes[2].path).toBe("/root/Parent Leaf/other small leaf")
        expect(searchedNodes[3].path).toBe("/root/Parent Leaf/empty folder")
    })

    it("should not ignore a leading whitespace with exact match", () => {
        const searchedNodes = getNodesByGitignorePath(TEST_FILE_WITH_PATHS.map, '" /root/Parent Leaf"')

        expect(searchedNodes.length).toBe(0)
    })

    it("should find nodes based on inverted search", () => {
        const searchedNodes = getNodesByGitignorePath(TEST_FILE_WITH_PATHS.map, "!leaf")

        expect(searchedNodes.length).toBe(1)
        expect(searchedNodes[0].path).toBe("/root")
    })

    it("should find nodes based on multiple inverted search", () => {
        const searchedNodes = getNodesByGitignorePath(TEST_FILE_WITH_PATHS.map, " \tsmall, \tbig")
        expect(searchedNodes.length).toBe(3)
        expect(searchedNodes[0].path).toBe("/root/big leaf")
        expect(searchedNodes[1].path).toBe("/root/Parent Leaf/small leaf")
        expect(searchedNodes[2].path).toBe("/root/Parent Leaf/other small leaf")

        const invertedSearchedNodes = getNodesByGitignorePath(TEST_FILE_WITH_PATHS.map, "! \tsmall, \tbig")

        expect(invertedSearchedNodes.length).toBe(3)
        expect(invertedSearchedNodes[0].path).toBe("/root")
        expect(invertedSearchedNodes[1].path).toBe("/root/Parent Leaf")
        expect(invertedSearchedNodes[2].path).toBe("/root/Parent Leaf/empty folder")
    })
})
