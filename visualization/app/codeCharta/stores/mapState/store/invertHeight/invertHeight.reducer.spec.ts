import { setInvertHeight } from "./invertHeight.actions"
import { invertHeight } from "./invertHeight.reducer"

describe("invertHeight", () => {
    it("should set new invertHeight", () => {
        const result = invertHeight(false, setInvertHeight({ value: true }))

        expect(result).toBeTruthy()
    })
})
