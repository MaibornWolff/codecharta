import { showOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges.reducer"
import { setShowOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges.actions"

describe("showOnlyBuildingsWithEdges", () => {
	it("should set new showOnlyBuildingsWithEdges", () => {
		const result = showOnlyBuildingsWithEdges(false, setShowOnlyBuildingsWithEdges({ value: true }))

		expect(result).toBeTruthy()
	})
})
