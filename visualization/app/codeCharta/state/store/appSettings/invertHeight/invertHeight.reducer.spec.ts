import { invertHeight } from "./invertHeight.reducer"
import { setInvertHeight } from "./invertHeight.actions"

describe("invertHeight", () => {
	it("should set new invertHeight", () => {
		const result = invertHeight(false, setInvertHeight({ value: true }))

		expect(result).toBeTruthy()
	})
})
