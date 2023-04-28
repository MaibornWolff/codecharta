import { setSelectedBuildingId } from "./selectedBuildingId.actions"
import { selectedBuildingId } from "./selectedBuildingId.reducer"

describe("selectedBuildingId", () => {
	it("should update state", () => {
		const newState = selectedBuildingId(undefined, setSelectedBuildingId({ value: 1 }))
		expect(newState).toBe(1)
	})
})
