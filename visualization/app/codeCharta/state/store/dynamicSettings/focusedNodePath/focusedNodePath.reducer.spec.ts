import { focusedNodePath } from "./focusedNodePath.reducer"
import { FocusedNodePathAction, focusNode, unfocusAllNodes, unfocusNode } from "./focusedNodePath.actions"

describe("focusedNodePath", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = focusedNodePath(undefined, {} as FocusedNodePathAction)

			expect(result).toEqual([])
		})
	})

	describe("Action: FOCUS_NODE", () => {
		it("should set new focusedNodePath", () => {
			const result = focusedNodePath([], focusNode("some/path/*.ts"))

			expect(result).toEqual(["some/path/*.ts"])
		})

		it("should add focusedNodePath", () => {
			const result = focusedNodePath(["some/path/*.ts"], focusNode("foo.ts"))

			expect(result).toEqual(["foo.ts", "some/path/*.ts"])
		})

		it("should not allow to focus root folder", () => {
			const result = focusedNodePath([], focusNode("/root"))

			expect(result).toEqual([])
		})
	})

	describe("Action: UNFOCUS_NODE", () => {
		it("should remove focusedNodePath", () => {
			const result = focusedNodePath(["some/path/*.ts", "foo.ts"], unfocusNode())

			expect(result).toEqual(["foo.ts"])
		})
	})

	describe("Action: UNFOCUS_ALL_NODES", () => {
		it("should remove all focusedNodePaths", () => {
			const result = focusedNodePath(["some/path/*.ts", "foo.ts"], unfocusAllNodes())

			expect(result).toEqual([])
		})
	})
})
