import { edgeHeight } from "./edgeHeight.reducer"
import { EdgeHeightAction, setEdgeHeight } from "./edgeHeight.actions"

describe("edgeHeight", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = edgeHeight(undefined, {} as EdgeHeightAction)

			expect(result).toEqual(4)
		})
	})

	describe("Action: SET_EDGE_HEIGHT", () => {
		it("should set new edgeHeight", () => {
			const result = edgeHeight(4, setEdgeHeight(1))

			expect(result).toEqual(1)
		})

		it("should set default edgeHeight", () => {
			const result = edgeHeight(5, setEdgeHeight())

			expect(result).toEqual(4)
		})
	})
})
