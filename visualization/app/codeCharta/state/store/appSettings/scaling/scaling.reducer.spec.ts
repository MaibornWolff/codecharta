import { scaling } from "./scaling.reducer"
import { ScalingAction, setScaling } from "./scaling.actions"
import { Vector3 } from "three"

describe("scaling", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = scaling(undefined, {} as ScalingAction)

			expect(result).toEqual(new Vector3(1, 1, 1))
		})
	})

	describe("Action: SET_SCALING", () => {
		it("should set new scaling", () => {
			const result = scaling(new Vector3(1, 1, 1), setScaling(new Vector3(2, 2, 2)))

			expect(result).toEqual(new Vector3(2, 2, 2))
		})

		it("should set default scaling", () => {
			const result = scaling(new Vector3(2, 2, 2), setScaling())

			expect(result).toEqual(new Vector3(1, 1, 1))
		})
	})
})
