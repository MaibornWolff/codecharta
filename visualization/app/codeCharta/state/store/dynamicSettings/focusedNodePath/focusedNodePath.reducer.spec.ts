import { focusedNodePath } from "./focusedNodePath.reducer"
import { FocusedNodePathAction, setFocusedNodePath } from "./focusedNodePath.actions"

describe("focusedNodePath", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = focusedNodePath(undefined, {} as FocusedNodePathAction)

			expect(result).toEqual("")
		})
	})

	describe("Action: SET_FOCUSED_NODE_PATH", () => {
		it("should set new focusedNodePath", () => {
			const result = focusedNodePath("", setFocusedNodePath("some/path/*.ts"))

			expect(result).toEqual("some/path/*.ts")
		})
	})
})
