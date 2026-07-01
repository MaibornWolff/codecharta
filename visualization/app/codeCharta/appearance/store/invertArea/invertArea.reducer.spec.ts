import { invertArea } from "./invertArea.reducer"
import { setInvertArea } from "./invertArea.actions"

describe("invertArea", () => {
    it("should set new invertArea", () => {
        const result = invertArea(false, setInvertArea({ value: true }))

        expect(result).toBeTruthy()
    })
})
