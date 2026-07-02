import { amountOfEdgePreviews } from "./amountOfEdgePreviews.reducer"
import { setAmountOfEdgePreviews } from "./amountOfEdgePreviews.actions"

describe("amountOfEdgePreviews", () => {
    it("should set new amountOfEdgePreviews", () => {
        const result = amountOfEdgePreviews(1, setAmountOfEdgePreviews({ value: 2 }))

        expect(result).toEqual(2)
    })
})
