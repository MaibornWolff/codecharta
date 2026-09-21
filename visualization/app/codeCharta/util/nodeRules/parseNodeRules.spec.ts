import { parseNodeRules } from "./parseNodeRules"

describe("parseNodeRules", () => {
    it("should parse multiple items", () => {
        expect(parseNodeRules("html,ts")).toEqual([{ path: "*html*" }, { path: "*ts*" }])
    })

    it("should parse multiple negated items", () => {
        expect(parseNodeRules("!html,ts")).toEqual([{ path: "!*html*" }, { path: "!*ts*" }])
    })
})
