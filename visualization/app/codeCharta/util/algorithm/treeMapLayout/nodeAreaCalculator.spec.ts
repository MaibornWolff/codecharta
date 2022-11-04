import { klona } from "klona"
import {
	STATE,
	VALID_NODE_NESTED_FOLDER_ONE_LEAF,
	VALID_NODE_NESTED_FOLDER_TWO_LEAVES,
	VALID_NODE_NESTED_FOLDER_LEAVES_DIFFERENT_NEST_LEVELS,
	VALID_NODE_NESTED_FOLDER_LEAVES_HUGE
} from "../../dataMocks"
import { hierarchy } from "d3-hierarchy"
import { calculateTotalNodeArea } from "./nodeAreaCalculator"
import { getChildrenAreaValues, getSmallestValueOrSmallestDifference } from "./modifiedTreeMapHelperFunctions"
import { calculatePaddingBasedOnBuildingArea } from "./paddingCalculator"
import { getBuildingAreasWithProportionalPadding } from "./treeMapGenerator"

describe("nodeAreaCalculator", () => {
	describe("calculateTotalNodeArea", () => {
		const state = STATE
		let padding = 10
		const MIN_BUILDING_AREA = 100

		it("should calculate total node area for nested folders'", () => {
			const map = klona(VALID_NODE_NESTED_FOLDER_ONE_LEAF)
			const hierarchyMap = hierarchy(map)

			const childrenAreaValues = getChildrenAreaValues(hierarchyMap, state)

			expect(childrenAreaValues).toStrictEqual([10])

			const smallestDelta = getSmallestValueOrSmallestDifference(childrenAreaValues)

			expect(smallestDelta).toStrictEqual(10)

			padding = calculatePaddingBasedOnBuildingArea(childrenAreaValues, smallestDelta, MIN_BUILDING_AREA, padding)

			expect(padding).toStrictEqual(10)

			const metricBuildingAreasIncludingPadding = getBuildingAreasWithProportionalPadding(
				childrenAreaValues,
				smallestDelta,
				MIN_BUILDING_AREA
			)

			expect(metricBuildingAreasIncludingPadding).toStrictEqual([100])

			const { rootWidth, rootHeight } = calculateTotalNodeArea(metricBuildingAreasIncludingPadding, hierarchyMap, padding, state)

			expect(rootHeight).toEqual(49)
			expect(rootWidth).toEqual(49)
		})

		it("should calculate total node area for nested folders with different-sized leaves, but no sub-folder label and padding'", () => {
			const map = klona(VALID_NODE_NESTED_FOLDER_TWO_LEAVES)
			const hierarchyMap = hierarchy(map)

			const childrenAreaValues = getChildrenAreaValues(hierarchyMap, state)

			expect(childrenAreaValues).toStrictEqual([10, 100])

			const smallestDelta = getSmallestValueOrSmallestDifference(childrenAreaValues)

			expect(smallestDelta).toStrictEqual(10)

			padding = calculatePaddingBasedOnBuildingArea(childrenAreaValues, smallestDelta, MIN_BUILDING_AREA, padding)

			expect(padding).toStrictEqual(5)

			const metricBuildingAreasIncludingPadding = getBuildingAreasWithProportionalPadding(
				childrenAreaValues,
				smallestDelta,
				MIN_BUILDING_AREA
			)

			const { rootWidth, rootHeight } = calculateTotalNodeArea(metricBuildingAreasIncludingPadding, hierarchyMap, padding, state)

			expect(rootHeight).toEqual(91)
			expect(rootWidth).toEqual(91)
		})

		it("should calculate total node area for differently nested folders", () => {
			const map = klona(VALID_NODE_NESTED_FOLDER_LEAVES_DIFFERENT_NEST_LEVELS)
			const hierarchyMap = hierarchy(map)

			const childrenAreaValues = getChildrenAreaValues(hierarchyMap, state)

			const smallestDelta = getSmallestValueOrSmallestDifference(childrenAreaValues)

			padding = calculatePaddingBasedOnBuildingArea(childrenAreaValues, smallestDelta, MIN_BUILDING_AREA, padding)

			const metricBuildingAreasIncludingPadding = getBuildingAreasWithProportionalPadding(
				childrenAreaValues,
				smallestDelta,
				MIN_BUILDING_AREA
			)

			const { rootWidth, rootHeight } = calculateTotalNodeArea(metricBuildingAreasIncludingPadding, hierarchyMap, padding, state)

			expect(rootHeight).toEqual(117)
			expect(rootWidth).toEqual(117)
		})

		it("should apply factor to huge maps", () => {
			const map = klona(VALID_NODE_NESTED_FOLDER_LEAVES_HUGE)
			const hierarchyMap = hierarchy(map)

			const childrenAreaValues = getChildrenAreaValues(hierarchyMap, state)

			const smallestDelta = getSmallestValueOrSmallestDifference(childrenAreaValues)

			padding = calculatePaddingBasedOnBuildingArea(childrenAreaValues, smallestDelta, MIN_BUILDING_AREA, padding)

			const metricBuildingAreasIncludingPadding = getBuildingAreasWithProportionalPadding(
				childrenAreaValues,
				smallestDelta,
				MIN_BUILDING_AREA
			)

			const { rootWidth, rootHeight } = calculateTotalNodeArea(metricBuildingAreasIncludingPadding, hierarchyMap, padding, state)

			expect(rootHeight).toEqual(40_000)
			expect(rootWidth).toEqual(40_000)
		})
	})
})
