import { calculatePaddingBasedOnBuildingArea } from "./paddingCalculator"

describe("paddingCalculator", () => {
	describe("calculatePaddingBasedOnBuildingArea", () => {
		let childrenAreaValues = []
		const MIN_BUILDING_AREA = 10
		let smallestDelta
		let padding

		beforeEach(() => {
			childrenAreaValues = [10, 20, 30, 40]
			smallestDelta = 10
			padding = 10
		})

		it("should calculate paddingByArea according to building area", () => {
			const paddingByArea = calculatePaddingBasedOnBuildingArea(childrenAreaValues, smallestDelta, MIN_BUILDING_AREA, padding)
			expect(paddingByArea).toBe(6)
		})

		it("almost doubling,  due to rounding, child areas and the delta should double the previous padding area", () => {
			childrenAreaValues.map(child => child * 4 - 1)
			smallestDelta = smallestDelta * 4 - 1
			const paddingByArea = calculatePaddingBasedOnBuildingArea(childrenAreaValues, smallestDelta, MIN_BUILDING_AREA, padding)
			expect(paddingByArea).toBe(12)
		})

		it("doubling, due to rounding, child areas and the delta should result in double the previous padding area + 1", () => {
			childrenAreaValues.map(child => child * 4)
			smallestDelta = smallestDelta * 4
			const paddingByArea = calculatePaddingBasedOnBuildingArea(childrenAreaValues, smallestDelta, MIN_BUILDING_AREA, padding)
			expect(paddingByArea).toBe(13)
		})

		it("almost doubling (Math.sqrt(4) = 2), due to rounding, padding should double the previous padding area", () => {
			padding = padding * 2 - 1
			const paddingByArea = calculatePaddingBasedOnBuildingArea(childrenAreaValues, smallestDelta, MIN_BUILDING_AREA, padding)
			expect(paddingByArea).toBe(12)
		})

		it("doubling (Math.sqrt(4) = 2), due to rounding, padding should result in double the previous padding area + 1", () => {
			padding = padding * 2
			const paddingByArea = calculatePaddingBasedOnBuildingArea(childrenAreaValues, smallestDelta, MIN_BUILDING_AREA, padding)
			expect(paddingByArea).toBe(13)
		})

		it("both values influence the paddingByArea by the same amount, so increasing both by half should be double the area + 1, due to rounding", () => {
			padding = padding * 1.5
			childrenAreaValues.map(child => child * 2)
			smallestDelta = smallestDelta * 2
			const paddingByArea = calculatePaddingBasedOnBuildingArea(childrenAreaValues, smallestDelta, MIN_BUILDING_AREA, padding)
			expect(paddingByArea).toBe(13)
		})
	})
})
