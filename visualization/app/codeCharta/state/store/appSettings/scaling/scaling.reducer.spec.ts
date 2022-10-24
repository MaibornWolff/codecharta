import { scaling } from "./scaling.reducer"
import { ScalingAction, setScaling } from "./scaling.actions"

describe("scaling", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = scaling(undefined, {} as ScalingAction)

			expect(result).toEqual({ x: 1, y: 1, z: 1 })
		})
	})

	describe("Action: SET_SCALING", () => {
		it("should set new scaling", () => {
			const result = scaling({ x: 1, y: 1, z: 1 }, setScaling({ x: 2, y: 2, z: 2 }))

			expect(result).toEqual({ x: 2, y: 2, z: 2 })
		})

		it("should update partial scaling", () => {
			const result = scaling({ x: 2, y: 2, z: 2 }, setScaling({ y: 1 }))

			expect(result).toEqual({ x: 2, y: 1, z: 2 })
		})
	})
})
