import { edgeHeight } from "./edgeHeight.reducer"
import { setEdgeHeight } from "./edgeHeight.actions"

describe("edgeHeight", () => {
	it("should set new edgeHeight", () => {
		const result = edgeHeight(4, setEdgeHeight({ value: 1 }))

		expect(result).toEqual(1)
	})
})
