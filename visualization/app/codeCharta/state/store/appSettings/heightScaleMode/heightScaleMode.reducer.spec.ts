import { heightScaleMode } from "./heightScaleMode.reducer"
import { setHeightScaleMode } from "./heightScaleMode.actions"
import { HeightScaleMode } from "../../../../codeCharta.model"

describe("heightScaleMode", () => {
    it("should set new heightScaleMode", () => {
        // Arrange / Act
        const result = heightScaleMode(HeightScaleMode.Linear, setHeightScaleMode({ value: HeightScaleMode.Logarithmic }))

        // Assert
        expect(result).toBe(HeightScaleMode.Logarithmic)
    })
})
