import { focusedNodePath } from "./focusedNodePath.reducer"
import { FocusedNodePathAction, focusNode, unfocusNode } from "./focusedNodePath.actions"

describe("focusedNodePath", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = focusedNodePath(undefined, {} as FocusedNodePathAction)

			expect(result).toEqual("")
		})
	})

	describe("Action: FOCUS_NODE", () => {
		it("should set new focusedNodePath", () => {
			const result = focusedNodePath("", focusNode("some/path/*.ts"))

			expect(result).toEqual("some/path/*.ts")
		})

		it("should set default focusedNodePath", () => {
			const result = focusedNodePath("some/path/*.ts", focusNode())

			expect(result).toEqual("")
		})
	})

	describe("Action: UNFOCUS_NODE", () => {
		it("should remove focusedNodePath", () => {
			const result = focusedNodePath("some/path/*.ts", unfocusNode())

			expect(result).toEqual("")
		})
	})
})
