import { setSelectedNodePath } from "./selectedNodePath.actions"
import { selectedNodePath } from "./selectedNodePath.reducer"

describe("selectedNodePath", () => {
    it("should update state", () => {
        const newState = selectedNodePath(undefined, setSelectedNodePath({ value: "/root/File.ts" }))
        expect(newState).toBe("/root/File.ts")
    })
})
