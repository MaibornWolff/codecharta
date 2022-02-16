import { setHoveredBuildingPath, SetHoveredBuildingPathAction, SetHoveredBuildingPathPayload } from "./hoveredBuildingPath.actions"
import { hoveredBuildingPath } from "./hoveredBuildingPath.reducer"

describe("hoveredBuildingPath", () => {
	it("should be initialized to null", () => {
		expect(hoveredBuildingPath(undefined as SetHoveredBuildingPathPayload, {} as SetHoveredBuildingPathAction)).toBe(null)
	})

	it("should set hovered building path", () => {
		expect(hoveredBuildingPath(null, setHoveredBuildingPath("this-is-the-way"))).toBe("this-is-the-way")
	})
})
