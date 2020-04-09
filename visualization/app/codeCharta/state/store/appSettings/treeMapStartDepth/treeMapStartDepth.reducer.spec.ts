import { treeMapStartDepth } from "./treeMapStartDepth.reducer"
import { TreeMapStartDepthAction, setTreeMapStartDepth } from "./treeMapStartDepth.actions"

describe("treeMapStartDepth", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = treeMapStartDepth(undefined, {} as TreeMapStartDepthAction)

			expect(result).toEqual(0)
		})
	})

	describe("Action: SET_TREE_MAP_START_DEPTH", () => {
		it("should set new treeMapStartDepth", () => {
			const result = treeMapStartDepth(0, setTreeMapStartDepth(1))

			expect(result).toEqual(1)
		})

		it("should set default treeMapStartDepth", () => {
			const result = treeMapStartDepth(1, setTreeMapStartDepth())

			expect(result).toEqual(0)
		})
	})
})
