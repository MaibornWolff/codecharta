import { margin } from "./margin.reducer"
import { setMargin } from "./margin.actions"

describe("margin", () => {
	it("should set new margin", () => {
		expect(margin(21, setMargin({ value: 42 }))).toEqual(42)
	})
})
