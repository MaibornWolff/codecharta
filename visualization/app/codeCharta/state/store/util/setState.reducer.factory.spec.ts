import { mergeState, setState } from "./setState.reducer.factory"

describe("setState.reducer.factory", () => {
	describe("setState", () => {
		it("should return default state when action payload is undefined", () => {
			expect(setState(2)(undefined, { type: "generic", value: undefined })).toBe(2)
		})

		it("should return value of action", () => {
			expect(setState(2)(undefined, { type: "generic", value: 3 })).toBe(3)
		})
	})

	describe("mergeState", () => {
		const defaultState: { a: string; b: string } = { a: "a", b: "b" }
		it("should return default state when action payload is undefined", () => {
			expect(mergeState(defaultState)(defaultState, { type: "generic", value: undefined })).toBe(defaultState)
		})

		it("should merge in value of action", () => {
			expect(mergeState(defaultState)(defaultState, { type: "generic", value: { a: "A" } })).toEqual({ a: "A", b: "b" })
		})
	})
})
