import rootReducer from "./reducer"
import { StateAction } from "./state.actions"
import { DEFAULT_STATE } from "../../util/dataMocks"

describe("rootReducer", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = rootReducer(undefined, {} as StateAction)

			expect(result).toEqual(DEFAULT_STATE)
		})
	})
})
