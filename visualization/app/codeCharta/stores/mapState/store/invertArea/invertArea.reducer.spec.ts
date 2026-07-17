import { setInvertArea } from "./invertArea.actions"
import { invertArea } from "./invertArea.reducer"

describe("invertArea", () => {
    it("should set new invertArea", () => {
        const result = invertArea(false, setInvertArea({ value: true }))

        expect(result).toBeTruthy()
    })
})
