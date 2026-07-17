import { setIsWhiteBackground } from "./isWhiteBackground.actions"
import { isWhiteBackground } from "./isWhiteBackground.reducer"

describe("isWhiteBackground", () => {
    it("should set new isWhiteBackground", () => {
        const result = isWhiteBackground(false, setIsWhiteBackground({ value: true }))

        expect(result).toBe(true)
    })
})
