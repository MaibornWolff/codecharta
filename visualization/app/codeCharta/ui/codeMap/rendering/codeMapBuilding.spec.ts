import { CodeMapBuilding } from "./codeMapBuilding"
import { TEST_NODE_ROOT } from "../../../util/dataMocks"
import { Vector3 } from "three"
import { ColorConverter } from "../../../util/color/colorConverter"

function mockColorConverter() {
	ColorConverter.colorToVector3 = jest.fn().mockReturnValue(new Vector3(0, 1, 2))
}

describe("CodeMapBuilding", () => {
	let building: CodeMapBuilding
	let building1: CodeMapBuilding
	let building2: CodeMapBuilding

	const MAP_SIZE = 250

	beforeEach(() => {
		mockColorConverter()

		building = new CodeMapBuilding(0, null, TEST_NODE_ROOT, "#00BFFF")
		building1 = new CodeMapBuilding(0, null, TEST_NODE_ROOT, "#DDCC00")
		building2 = new CodeMapBuilding(1, null, TEST_NODE_ROOT, "#820E0E")
	})

	describe("getCenterPoint", () => {
		it("should return the center point of a building", () => {
			const result = building.getCenterPoint(MAP_SIZE)
			const expected = new Vector3(-244.5, 8, -241.5)

			expect(result.x).toBe(expected.x)
			expect(result.y).toBe(expected.y)
			expect(result.z).toBe(expected.z)
		})
	})

	describe("decreaseLightness", () => {
		it("should set color correctly", () => {
			building.decreaseLightness(5)

			expect(building.color).toEqual("#00ACE6")
		})

		it("should set color correctly and not keep lightness at 10", () => {
			building.decreaseLightness(100)

			expect(building.color).toEqual("#002633")
		})

		it("should set deltaColor correctly when delta is enabled", () => {
			building["_node"].deltas = {}
			building["_defaultDeltaColor"] = "#ABCDEF"

			building.decreaseLightness(100)

			expect(building.deltaColor).toEqual("#08192B")
		})
	})

	describe("getColorVector", () => {
		it("should call colorToVector3 and return it's value", () => {
			building.setColor("#ABCDEF")
			const result = building.getColorVector()

			expect(result.x).toBe(0)
			expect(result.y).toBe(1)
			expect(result.z).toBe(2)
			expect(ColorConverter.colorToVector3).toHaveBeenCalledWith("#ABCDEF")
		})
	})

	describe("getDefaultColorVector", () => {
		it("should call colorToVector3 and return it's value", () => {
			const result = building.getDefaultColorVector()

			expect(result.x).toBe(0)
			expect(result.y).toBe(1)
			expect(result.z).toBe(2)
			expect(ColorConverter.colorToVector3).toHaveBeenCalledWith("#00BFFF")
		})
	})

	describe("resetColor", () => {
		it("should reset the colors back to their defaultColors", () => {
			building.setColor("#ABCDEF")
			building["_defaultDeltaColor"] = "#ABCDEF"

			building.resetColor()

			expect(building.color).toEqual("#00BFFF")
			expect(building.deltaColor).toEqual("#ABCDEF")
		})
	})

	describe("equals", () => {
		it("should return true if two buildings have the same id", () => {
			expect(building.equals(building1)).toBeTruthy()
		})

		it("should return false if two buildings have different ids", () => {
			expect(building.equals(building2)).toBeFalsy()
		})
	})

	describe("setColor", () => {
		it("should set the color", () => {
			building1.setColor("#A0B1C2")

			expect(building1.color).toEqual("#A0B1C2")
		})
	})
})
