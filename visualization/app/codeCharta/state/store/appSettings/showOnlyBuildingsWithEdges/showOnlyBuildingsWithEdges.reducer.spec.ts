import { showOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges.reducer"
import { ShowOnlyBuildingsWithEdgesAction, setShowOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges.actions"

describe("showOnlyBuildingsWithEdges", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = showOnlyBuildingsWithEdges(undefined, {} as ShowOnlyBuildingsWithEdgesAction)

			expect(result).toEqual(false)
		})
	})

	describe("Action: SET_SHOW_ONLY_BUILDINGS_WITH_EDGES", () => {
		it("should set new showOnlyBuildingsWithEdges", () => {
			const result = showOnlyBuildingsWithEdges(false, setShowOnlyBuildingsWithEdges(true))

			expect(result).toEqual(true)
		})
	})
})
