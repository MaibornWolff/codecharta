import { focusedNodePath } from "./focusedNodePath.reducer"
import { focusNode, setAllFocusedNodes, unfocusAllNodes, unfocusNode } from "./focusedNodePath.actions"

describe("focusedNodePath", () => {
    describe("Action: FOCUS_NODE", () => {
        it("should set new focusedNodePath", () => {
            const result = focusedNodePath([], focusNode({ value: "some/path/*.ts" }))

            expect(result).toEqual(["some/path/*.ts"])
        })

        it("should add focusedNodePath", () => {
            const result = focusedNodePath(["some/path/*.ts"], focusNode({ value: "foo.ts" }))

            expect(result).toEqual(["foo.ts", "some/path/*.ts"])
        })

        it("should not allow to focus root folder", () => {
            const result = focusedNodePath([], focusNode({ value: "/root" }))

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

    describe("Action: SET_ALL_FOCUSED_NODES", () => {
        it("should set all focusedNodePaths", () => {
            const result = focusedNodePath([], setAllFocusedNodes({ value: ["some/path/*.ts", "foo.ts"] }))

            expect(result).toEqual(["some/path/*.ts", "foo.ts"])
        })
    })
})
