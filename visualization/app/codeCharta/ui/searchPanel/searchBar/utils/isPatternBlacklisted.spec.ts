import { isPatternBlacklisted } from "./isPatternBlacklisted"

describe("isPatternBlacklisted", () => {
    it("should recognized an exact match", () => {
        expect(isPatternBlacklisted([{ type: "flatten", path: "*needle*" }], "flatten", "*needle*")).toBe(true)
    })

    it("should recognized * matches", () => {
        expect(isPatternBlacklisted([{ type: "flatten", path: "*needle*" }], "flatten", "needle")).toBe(true)
    })

    it("should not recognized * vs absolute value", () => {
        expect(isPatternBlacklisted([{ type: "flatten", path: "*needle*" }], "flatten", "/needle")).toBe(false)
    })

    it("should ignore different blacklist type", () => {
        expect(isPatternBlacklisted([{ type: "flatten", path: "*needle*" }], "exclude", "*needle*")).toBe(false)
    })
})
