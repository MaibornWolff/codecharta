import { setSelectedBuildingId, SetSelectedBuildingIdAction } from "./selectedBuildingId.actions"
import { selectedBuildingId } from "./selectedBuildingId.reducer"

describe("selectedBuildingId", () => {
	it("should set default state", () => {
		const newState = selectedBuildingId(undefined, {} as SetSelectedBuildingIdAction)
		expect(newState).toBe(null)
	})

	it("should update state", () => {
		const newState = selectedBuildingId(undefined, setSelectedBuildingId(1))
		expect(newState).toBe(1)
	})

	it("should ignore actions other than its own", () => {
		const newState = selectedBuildingId(1, { type: "someType", payload: 2 } as unknown as SetSelectedBuildingIdAction)
		expect(newState).toBe(1)
	})
})
