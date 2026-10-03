import { focusNode, setAllFocusedNodes, unfocusNode } from "./focusedNodePath.actions"
import { focusedNodePath } from "./focusedNodePath.reducer"

describe("focusedNodePath", () => {
    describe("Action: FOCUS_NODE", () => {
        it("should set new focusedNodePath", () => {
            const result = focusedNodePath([], focusNode({ value: "some/path/*.ts" }))

            expect(result).toEqual(["some/path/*.ts"])
        })

        it("should replace the focus there was, so a single unfocus leaves it", () => {
            const result = focusedNodePath(["some/path"], focusNode({ value: "some/path/deeper" }))

            expect(result).toEqual(["some/path/deeper"])
        })

        it("should not allow to focus root folder", () => {
            const result = focusedNodePath([], focusNode({ value: "/root" }))

            expect(result).toEqual([])
        })
    })

    describe("Action: UNFOCUS_NODE", () => {
        it("should leave the focus", () => {
            const result = focusedNodePath(["some/path"], unfocusNode())

            expect(result).toEqual([])
        })

        it("should leave a stack of focuses an older state still carries at once", () => {
            const result = focusedNodePath(["some/path/deeper", "some/path"], unfocusNode())

            expect(result).toEqual([])
        })
    })

    describe("Action: SET_ALL_FOCUSED_NODES", () => {
        it("should restore the focus", () => {
            const result = focusedNodePath([], setAllFocusedNodes({ value: ["some/path"] }))

            expect(result).toEqual(["some/path"])
        })

        it("should keep only the current focus of a stack saved by an older version", () => {
            const result = focusedNodePath([], setAllFocusedNodes({ value: ["some/path/deeper", "some/path"] }))

            expect(result).toEqual(["some/path/deeper"])
        })
    })
})
