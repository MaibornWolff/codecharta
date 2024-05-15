import { getFileCount } from "./fileCountSelector"

describe("getFileCount", () => {
    it("should return nothing when it receives no building", () => {
        const node = undefined
        expect(getFileCount(node)).toBe(undefined)
    })

    it("should return file count object with default values when it receives a building with no attributes and changed files", () => {
        const node = {}
        expect(getFileCount(node)).toEqual({ all: 0, added: 0, removed: 0, changed: 0 })
    })

    it("should return file count object that has the same values as the value assignments of the received attributes and changed files", () => {
        const node = { attributes: { unary: 4 }, fileCount: { added: 2, removed: 1, changed: 3 } }
        expect(getFileCount(node)).toEqual({ all: 4, added: 2, removed: 1, changed: 3 })
    })
})
