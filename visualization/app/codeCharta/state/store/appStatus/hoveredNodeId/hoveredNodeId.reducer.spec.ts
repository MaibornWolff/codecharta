import { setHoveredNodeId } from "./hoveredNodeId.actions"
import { hoveredNodeId } from "./hoveredNodeId.reducer"

describe("hoveredNodeId", () => {
	it("should set hovered node id", () => {
		expect(hoveredNodeId(null, setHoveredNodeId({ value: 42 }))).toBe(42)
	})
})
