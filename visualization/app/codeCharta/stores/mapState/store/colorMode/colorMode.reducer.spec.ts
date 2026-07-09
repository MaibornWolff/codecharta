import { ColorMode } from "../../../../model/codeCharta.model"
import { setColorMode } from "./colorMode.actions"
import { colorMode } from "./colorMode.reducer"

describe("colorMode", () => {
    it("should set new colorMode", () => {
        const result = colorMode(ColorMode.weightedGradient, setColorMode({ value: ColorMode.absolute }))

        expect(result).toEqual(ColorMode.absolute)
    })
})
