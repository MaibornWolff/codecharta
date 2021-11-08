import { building2fileCountDescription } from "./fileCountDescription.selector"

describe("building2fileCountDescription", () => {
	it("should return nothing when it receives no building", () => {
		const building = undefined
		expect(building2fileCountDescription(building)).toBe(undefined)
	})

	it("should return 'empty' when it receives a building with no unary value", () => {
		const building = { node: { attributes: { unary: 0 } } }
		expect(building2fileCountDescription(building)).toBe("empty")
	})

	it("should return '1 file' when it receives a building with a unary value of 1", () => {
		const building = { node: { attributes: { unary: 1 } } }
		expect(building2fileCountDescription(building)).toBe("1 file")
	})

	it("should return '4 files' when it receives a building with a unary value of 4", () => {
		const building = { node: { attributes: { unary: 4 } } }
		expect(building2fileCountDescription(building)).toBe("4 files")
	})
})
