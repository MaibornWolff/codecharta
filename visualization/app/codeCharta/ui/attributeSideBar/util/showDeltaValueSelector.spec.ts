import { _shouldShowDeltaValue } from "./showDeltaValueSelector"

describe("_shouldShowDeltaValue", () => {
    it("should return true if given node has deltas key", () => {
        expect(_shouldShowDeltaValue({ deltas: {} })).toBe(true)
    })

    it("should return false if given node has no deltas key", () => {
        expect(_shouldShowDeltaValue({})).toBe(false)
    })

    it("should return false if given nothing", () => {
        const node = undefined
        expect(_shouldShowDeltaValue(node)).toBe(false)
    })
})
