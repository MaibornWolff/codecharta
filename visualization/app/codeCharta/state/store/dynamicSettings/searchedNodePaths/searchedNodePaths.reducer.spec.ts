import { searchedNodePaths } from "./searchedNodePaths.reducer"
import { SearchedNodePathsAction, setSearchedNodePaths } from "./searchedNodePaths.actions"

describe("searchedNodePaths", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = searchedNodePaths(undefined, {} as SearchedNodePathsAction)

			expect([...result]).toEqual([])
		})
	})

	describe("Action: SET_SEARCHED_NODE_PATHS", () => {
		it("should set new searchedNodePaths", () => {
			const result = searchedNodePaths(new Set(), setSearchedNodePaths(new Set(["myPath", "anotherPath"])))

			expect([...result]).toEqual(["myPath", "anotherPath"])
		})

		it("should set new searchedNodePaths", () => {
			const result = searchedNodePaths(new Set(["myPath", "anotherPath"]), setSearchedNodePaths())

			expect([...result]).toEqual([])
		})
	})
})
