import { createRuleMatcher, parseNodeRule } from "./gitignorePattern"

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
})
