import { setHoveredNodeId, SetHoveredNodeIdAction, SetHoveredNodeIdPayload } from "./hoveredNodeId.actions"
import { hoveredNodeId } from "./hoveredNodeId.reducer"

describe("hoveredNodeId", () => {
	it("should be initialized to null", () => {
		expect(hoveredNodeId(undefined as SetHoveredNodeIdPayload, {} as SetHoveredNodeIdAction)).toBe(null)
	})

	it("should set hovered building path", () => {
		expect(hoveredNodeId(null, setHoveredNodeId("this-is-the-way"))).toBe("this-is-the-way")
	})
})
