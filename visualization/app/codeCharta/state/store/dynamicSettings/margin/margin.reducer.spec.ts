import { margin } from "./margin.reducer"
import { defaultMargin, MarginAction, setMargin } from "./margin.actions"

describe("margin", () => {
	it("should initialize the default state", () => {
		expect(margin(undefined, {} as MarginAction)).toBe(defaultMargin)
	})

	it("should set new margin", () => {
		expect(margin(21, setMargin(42))).toEqual(42)
	})
})
