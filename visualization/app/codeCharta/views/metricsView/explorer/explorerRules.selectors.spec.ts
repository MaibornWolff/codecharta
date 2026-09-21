import { RuleWithCount } from "../../../features/sidebarExplorer/facade"
import { CodeMapNode, NodeRule, NodeType } from "../../../model/codeCharta.model"
import { excludeRulesWithCountSelector, flattenRulesWithCountSelector } from "./explorerRules.selectors"

const pathRules = (rules: RuleWithCount[]) => rules.filter(rule => rule.kind !== "METRIC")

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
            const nodeRules: NodeRule[] = [{ path: "!alpha" }]

            // Act
            const result = flattenRulesWithCountSelector.projector(nodeRules, allLeaves, [])

            // Assert
            expect(result).toHaveLength(1)
            expect(result[0].affectedCount).toBe(2)
        })

        it("should count a bare rule as a substring match", () => {
            // Arrange
            const nodeRules: NodeRule[] = [{ path: "alpha" }]

            // Act
            const result = flattenRulesWithCountSelector.projector(nodeRules, allLeaves, [])

            // Assert
            expect(result[0].affectedCount).toBe(2)
        })

        it("should mark wildcard paths as RULE and concrete paths as MANUAL", () => {
            // Arrange
            const nodeRules: NodeRule[] = [{ path: "*.spec.ts*" }, { path: "/root/src/alpha.kt" }]

            // Act
            const result = flattenRulesWithCountSelector.projector(nodeRules, allLeaves, [])

            // Assert
            expect(pathRules(result).find(rule => rule.item.path === "*.spec.ts*").kind).toBe("RULE")
            expect(pathRules(result).find(rule => rule.item.path === "/root/src/alpha.kt").kind).toBe("MANUAL")
        })

        it("should mark every row with the effect of the list it came from", () => {
            // Arrange — the list a rule sits in now says what it does, so there is nothing to filter
            const flattenedNodes: NodeRule[] = [{ path: "*alpha*" }, { path: "*node_modules*" }]

            // Act
            const result = flattenRulesWithCountSelector.projector(flattenedNodes, allLeaves, [])

            // Assert
            expect(result).toHaveLength(2)
            expect(pathRules(result).every(rule => rule.effect === "flatten")).toBe(true)
        })
    })

    describe("excludeRulesWithCountSelector", () => {
        const allLeaves: CodeMapNode[] = [makeLeaf("/root/src/alpha.kt"), makeLeaf("/root/node_modules/beta.kt")]

        it("should count the leaves each exclude rule affects", () => {
            // Arrange
            const excludedNodes: NodeRule[] = [{ path: "*node_modules*" }]

            // Act
            const result = excludeRulesWithCountSelector.projector(excludedNodes, allLeaves, [])

            // Assert
            expect(result).toHaveLength(1)
            expect(pathRules(result)[0].item.path).toBe("*node_modules*")
            expect(pathRules(result)[0].effect).toBe("exclude")
            expect(result[0].affectedCount).toBe(1)
        })
    })
})
