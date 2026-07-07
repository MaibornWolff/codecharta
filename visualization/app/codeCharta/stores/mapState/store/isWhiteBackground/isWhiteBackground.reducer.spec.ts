import { isWhiteBackground } from "./isWhiteBackground.reducer"
import { setIsWhiteBackground } from "./isWhiteBackground.actions"

describe("isWhiteBackground", () => {
    it("should set new isWhiteBackground", () => {
        const result = isWhiteBackground(false, setIsWhiteBackground({ value: true }))

        expect(result).toBe(true)
    })
})
