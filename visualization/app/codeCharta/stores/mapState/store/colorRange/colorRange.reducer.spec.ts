import { setColorRange } from "./colorRange.actions"
import { colorRange } from "./colorRange.reducer"

describe("colorRange", () => {
    it("should set new colorRange", () => {
        const result = colorRange({ from: 0, to: 0 }, setColorRange({ value: { from: 21, to: 42 } }))

        expect(result).toEqual({ from: 21, to: 42 })
    })
})
