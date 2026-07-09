import { setAmountOfEdgePreviews } from "./amountOfEdgePreviews.actions"
import { amountOfEdgePreviews } from "./amountOfEdgePreviews.reducer"

describe("amountOfEdgePreviews", () => {
    it("should set new amountOfEdgePreviews", () => {
        const result = amountOfEdgePreviews(1, setAmountOfEdgePreviews({ value: 2 }))

        expect(result).toEqual(2)
    })
})
