import { BlacklistItem, CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { excludeRulesWithCountSelector, flattenRulesWithCountSelector } from "./explorerRules.selectors"

const makeLeaf = (path: string, attributes: Record<string, number> = { unary: 1, rloc: 1 }): CodeMapNode => ({
    name: path.split("/").pop() ?? path,
    path,
    type: NodeType.FILE,
    attributes
})

describe("explorerRules.selectors", () => {
    describe("flattenRulesWithCountSelector", () => {
        const allLeaves: CodeMapNode[] = [
            makeLeaf("/root/src/alpha.kt"),
            makeLeaf("/root/src/beta.kt"),
            makeLeaf("/root/src/gamma.kt"),
            makeLeaf("/root/test/alpha.spec.ts")
        ]

        it("should count leaves affected by a negated rule instead of returning zero", () => {
            // Arrange: "!alpha" flattens the two leaves that do not contain "alpha"
            const blacklist: BlacklistItem[] = [{ type: "flatten", path: "!alpha" }]

            // Act
            const result = flattenRulesWithCountSelector.projector(blacklist, allLeaves)

            // Assert
            expect(result).toHaveLength(1)
            expect(result[0].affectedCount).toBe(2)
        })

        it("should count a bare rule as a substring match", () => {
            // Arrange
            const blacklist: BlacklistItem[] = [{ type: "flatten", path: "alpha" }]

            // Act
            const result = flattenRulesWithCountSelector.projector(blacklist, allLeaves)

            // Assert
            expect(result[0].affectedCount).toBe(2)
        })

        it("should mark wildcard paths as RULE and concrete paths as MANUAL", () => {
            // Arrange
            const blacklist: BlacklistItem[] = [
                { type: "flatten", path: "*.spec.ts*" },
                { type: "flatten", path: "/root/src/alpha.kt" }
            ]

            // Act
            const result = flattenRulesWithCountSelector.projector(blacklist, allLeaves)

            // Assert
            expect(result.find(rule => rule.item.path === "*.spec.ts*").kind).toBe("RULE")
            expect(result.find(rule => rule.item.path === "/root/src/alpha.kt").kind).toBe("MANUAL")
        })

        it("should not include exclude items", () => {
            // Arrange
            const blacklist: BlacklistItem[] = [
                { type: "flatten", path: "*alpha*" },
                { type: "exclude", path: "*node_modules*" }
            ]

            // Act
            const result = flattenRulesWithCountSelector.projector(blacklist, allLeaves)

            // Assert
            expect(result).toHaveLength(1)
            expect(result[0].item.type).toBe("flatten")
        })
    })

    describe("excludeRulesWithCountSelector", () => {
        const allLeaves: CodeMapNode[] = [makeLeaf("/root/src/alpha.kt"), makeLeaf("/root/node_modules/beta.kt")]

        it("should only include exclude items", () => {
            // Arrange
            const blacklist: BlacklistItem[] = [
                { type: "flatten", path: "*alpha*" },
                { type: "exclude", path: "*node_modules*" }
            ]

            // Act
            const result = excludeRulesWithCountSelector.projector(blacklist, allLeaves)

            // Assert
            expect(result).toHaveLength(1)
            expect(result[0].item.path).toBe("*node_modules*")
            expect(result[0].affectedCount).toBe(1)
        })
    })
})
