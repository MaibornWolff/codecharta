import { heightScalePowerExponent } from "./heightScalePowerExponent.reducer"
import { setHeightScalePowerExponent } from "./heightScalePowerExponent.actions"

describe("heightScalePowerExponent", () => {
    it("should set new heightScalePowerExponent", () => {
        // Arrange / Act
        const result = heightScalePowerExponent(0.5, setHeightScalePowerExponent({ value: 0.3 }))

        // Assert
        expect(result).toBe(0.3)
    })
})
