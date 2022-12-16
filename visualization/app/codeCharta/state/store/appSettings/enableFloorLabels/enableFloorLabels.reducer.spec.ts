import { enableFloorLabels } from "./enableFloorLabels.reducer"
import { EnableFloorLabelAction, setEnableFloorLabels } from "./enableFloorLabels.actions"

describe("enableFloorLabel", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = enableFloorLabels(undefined, {} as EnableFloorLabelAction)

			expect(result).toBeTruthy()
		})
	})

	describe("Action: SET_ENABLE_FLOOR_LABEL", () => {
		it("should set new enableFloorLabel", () => {
			const result = enableFloorLabels(true, setEnableFloorLabels(false))

			expect(result).toBeFalsy()
		})

		it("should set default colorMetric", () => {
			const result = enableFloorLabels(false, setEnableFloorLabels())

			expect(result).toBeTruthy()
		})
	})
})
