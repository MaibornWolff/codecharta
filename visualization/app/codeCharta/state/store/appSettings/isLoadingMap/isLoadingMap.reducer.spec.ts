import { isLoadingMap } from "./isLoadingMap.reducer"
import { IsLoadingMapAction, setIsLoadingMap } from "./isLoadingMap.actions"
import { setHoveredNodeId } from "../../appStatus/hoveredNodeId/hoveredNodeId.actions"

describe("isLoadingMap", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = isLoadingMap(undefined, {} as IsLoadingMapAction)

			expect(result).toBe(true)
		})
	})

	describe("Action: SET_IS_LOADING_MAP", () => {
		it("should set new isLoadingMap", () => {
			const result = isLoadingMap(true, setIsLoadingMap(false))

			expect(result).toBe(false)
		})

		it("should set default isLoadingMap", () => {
			const result = isLoadingMap(false, setIsLoadingMap())

			expect(result).toBe(true)
		})
	})

	describe("Other Actions to (not) set isLoadingMap to true", () => {
		it("'should' set isLoadingMap to true on a random action", () => {
			expect(isLoadingMap(false, { type: "any" } as unknown as IsLoadingMapAction)).toBe(true)
		})

		it("'should' not set isLoadingMap to true on an explicit excluded action", () => {
			expect(isLoadingMap(false, setHoveredNodeId(null) as unknown as IsLoadingMapAction)).toBe(false)
		})
	})
})
