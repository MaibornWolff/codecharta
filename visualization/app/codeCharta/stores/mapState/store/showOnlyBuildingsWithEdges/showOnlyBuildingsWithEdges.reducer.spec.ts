import { setShowOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges.actions"
import { showOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges.reducer"

describe("showOnlyBuildingsWithEdges", () => {
    it("should set new showOnlyBuildingsWithEdges", () => {
        const result = showOnlyBuildingsWithEdges(false, setShowOnlyBuildingsWithEdges({ value: true }))

        expect(result).toBeTruthy()
    })
})
