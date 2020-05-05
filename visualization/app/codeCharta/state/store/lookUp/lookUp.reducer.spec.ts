import { DEFAULT_STATE } from "../../../util/dataMocks"
import lookUp from "./lookUp.reducer"
import { LookUpAction } from "./lookUp.actions"

describe("lookUp", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = lookUp(undefined, {} as LookUpAction)

			expect(result).toEqual(DEFAULT_STATE.lookUp)
		})
	})
})
