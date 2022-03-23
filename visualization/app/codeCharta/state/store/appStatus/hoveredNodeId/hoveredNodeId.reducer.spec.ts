import { setHoveredNodeId, SetHoveredNodeIdAction, SetHoveredNodeIdPayload } from "./hoveredNodeId.actions"
import { hoveredNodeId } from "./hoveredNodeId.reducer"

describe("hoveredNodeId", () => {
	it("should be initialized to null", () => {
		expect(hoveredNodeId(undefined as SetHoveredNodeIdPayload, {} as SetHoveredNodeIdAction)).toBe(null)
	})

	it("should set hovered node id", () => {
		expect(hoveredNodeId(null, setHoveredNodeId(42))).toBe(42)
	})
})
