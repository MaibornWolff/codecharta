import { colorMode } from "./colorMode.reducer"
import { setColorMode } from "./colorMode.actions"
import { ColorMode } from "../../../../codeCharta.model"

describe("colorMode", () => {
    it("should set new colorMode", () => {
        const result = colorMode(ColorMode.weightedGradient, setColorMode({ value: ColorMode.absolute }))

        expect(result).toEqual(ColorMode.absolute)
    })
})
