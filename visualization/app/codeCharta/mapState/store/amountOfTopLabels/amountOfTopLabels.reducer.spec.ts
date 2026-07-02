import { amountOfTopLabels } from "./amountOfTopLabels.reducer"
import { setAmountOfTopLabels } from "./amountOfTopLabels.actions"

describe("amountOfTopLabels", () => {
    it("should set new amountOfTopLabels", () => {
        const result = amountOfTopLabels(1, setAmountOfTopLabels({ value: 2 }))

        expect(result).toEqual(2)
    })
})
