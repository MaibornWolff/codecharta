import { createRuleMatcher, parseNodeRule, ruleForNodePath, toRuleLines, transformPath } from "./gitignorePattern"

describe("gitignorePattern", () => {
    describe("parseNodeRule", () => {
        it("should wrap a bare pattern so any path containing it matches", () => {
            // Act
            const patterns = parseNodeRule("alpha")

            // Assert
            expect(patterns).toEqual({ includes: ["*alpha*"], excludes: [] })
        })

        it("should keep a quoted pattern exact", () => {
            // Act
            const patterns = parseNodeRule('"alpha.ts"')

            // Assert
            expect(patterns).toEqual({ includes: ["alpha.ts"], excludes: [] })
        })

        it("should keep a path from the root anchored at the root", () => {
            // Act & Assert
            expect(parseNodeRule("/root/src").includes).toEqual(["/root/src"])
            expect(parseNodeRule("./root/src").includes).toEqual(["/root/src"])
        })

        it("should turn a negated rule into one that includes everything except its patterns", () => {
            // Act
            const patterns = parseNodeRule("!alpha, *.ts")

            // Assert
            expect(patterns).toEqual({ includes: null, excludes: ["*alpha*", "*.ts"] })
        })
    })

    describe("createRuleMatcher", () => {
        it("should match the paths a negated rule does not name", () => {
            // Arrange
            const matches = createRuleMatcher(parseNodeRule("!alpha"))

            // Act & Assert
            expect(matches("root/beta.ts")).toBe(true)
            expect(matches("root/alpha.ts")).toBe(false)
        })
    })

    describe("ruleForNodePath", () => {
        it("should match exactly the node whose path has glob characters in it", () => {
            // Arrange
            const matches = createRuleMatcher(parseNodeRule(ruleForNodePath("/root/app/[id].tsx")))

            // Act & Assert
            expect(matches(transformPath("/root/app/[id].tsx"))).toBe(true)
            expect(matches(transformPath("/root/app/i.tsx"))).toBe(false)
        })

        it("should keep a plain node path as it is", () => {
            // Act & Assert
            expect(ruleForNodePath("/root/src/app")).toBe("/root/src/app")
        })
    })

    describe("toRuleLines", () => {
        it("should put each pattern of a rule on a line of its own, as it was stored", () => {
            // Act
            const lines = toRuleLines("/root/src/app, *UserService*, !*spec*")

            // Assert
            expect(lines).toEqual(["/root/src/app", "*UserService*", "!*spec*"])
        })

        it("should mark every pattern of a negated rule as left out", () => {
            // Act
            const lines = toRuleLines("!*spec*, *test*")

            // Assert
            expect(lines).toEqual(["!*spec*", "!*test*"])
        })
    })
})
