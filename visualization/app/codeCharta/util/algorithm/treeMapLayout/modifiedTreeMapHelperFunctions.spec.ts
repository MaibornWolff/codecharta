import { getChildrenAreaValues, getSmallestDifference } from "./modifiedTreeMapHelperFunctions"
import { klona } from "klona"
import { STATE, TEST_DELTA_MAP_A, TEST_FILE_WITH_PATHS } from "../../dataMocks"
import { hierarchy } from "d3-hierarchy"

describe("modifiedTreeMapHelperFunctions", () => {
	describe("getSmallestDifference", () => {
		it("should calculate smallest difference between elements in a given array", () => {
			const values = [2, 4, 8, 12]
			const smallestDifference = getSmallestDifference(values)
			expect(smallestDifference).toBe(2)
		})

		it("should return smallest value, if smallest difference is 0", () => {
			const values = [2, 2, 8, 12]
			const smallestDifference = getSmallestDifference(values)
			expect(smallestDifference).toBe(2)
		})

		it("should return max value, when array is empty", () => {
			const values = []
			const smallestDifference = getSmallestDifference(values)
			expect(smallestDifference).toBe(Number.MAX_VALUE)
		})

		it("should return max value, when array is null", () => {
			const values = null
			const smallestDifference = getSmallestDifference(values)
			expect(smallestDifference).toBe(Number.MAX_VALUE)
		})
	})

	describe("getChildrenAreaValues", () => {
		const state = STATE

		it("should return children values", () => {
			const map = klona(TEST_DELTA_MAP_A.map)
			const hierarchyMap = hierarchy(map)
			const childrenAreaValues = getChildrenAreaValues(hierarchyMap, state)

			expect(childrenAreaValues).toStrictEqual([30, 70, 100])
		})

		it("should return children values, omitting the ones that are 0", () => {
			const map = klona(TEST_FILE_WITH_PATHS.map)
			const hierarchyMap = hierarchy(map)
			const childrenAreaValues = getChildrenAreaValues(hierarchyMap, state)

			expect(childrenAreaValues).toStrictEqual([30, 70, 100])
		})
	})
})
