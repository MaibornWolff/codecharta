import { getFileCount } from "./fileCountSelector"

describe("building2fileCountDescription", () => {
	it("should return nothing when it receives no building", () => {
		const node = undefined
		expect(getFileCount(node)).toBe(undefined)
	})

	it("should return 'empty' when it receives a building with no unary value", () => {
		const node = { attributes: { unary: 0 } }
		expect(getFileCount(node)).toBe("empty")
	})

	it("should return '1 file' when it receives a building with a unary value of 1", () => {
		const node = { attributes: { unary: 1 } }
		expect(getFileCount(node)).toBe("1 file")
	})

	it("should return '4 files' when it receives a building with a unary value of 4", () => {
		const node = { attributes: { unary: 4 }, deltas: { addedFiles: 2, removedFiles: 1 } }
		expect(getFileCount(node)).toEqual({ fileCount: 4, added: 2, removed: 1 })
	})
})
