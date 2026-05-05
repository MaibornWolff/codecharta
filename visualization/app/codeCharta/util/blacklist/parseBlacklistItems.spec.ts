import { parseBlacklistItems } from "./parseBlacklistItems"

describe("parseBlacklistItems", () => {
    it("should parse multiple items", () => {
        expect(parseBlacklistItems("flatten", "html,ts")).toEqual([
            { type: "flatten", path: "*html*" },
            { type: "flatten", path: "*ts*" }
        ])
    })

    it("should parse multiple negated items", () => {
        expect(parseBlacklistItems("flatten", "!html,ts")).toEqual([
            { type: "flatten", path: "!*html*" },
            { type: "flatten", path: "!*ts*" }
        ])
    })
})
