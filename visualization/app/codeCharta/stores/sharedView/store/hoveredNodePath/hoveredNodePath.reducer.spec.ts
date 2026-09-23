import { setHoveredNodePath } from "./hoveredNodePath.actions"
import { hoveredNodePath } from "./hoveredNodePath.reducer"

describe("hoveredNodePath", () => {
    it("should set hovered node id", () => {
        expect(hoveredNodePath(null, setHoveredNodePath({ value: "/root/File.ts" }))).toBe("/root/File.ts")
    })
})
