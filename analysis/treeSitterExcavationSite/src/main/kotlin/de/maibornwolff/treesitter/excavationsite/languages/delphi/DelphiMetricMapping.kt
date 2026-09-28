package de.maibornwolff.treesitter.excavationsite.languages.delphi

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * Delphi metric definitions.
 *
 * tree-sitter-pascal uses camelCase node types (unique in this project).
 */
object DelphiMetricMapping : MetricMapping {
    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        // Logic complexity nodes
        listOf(
            "if",
            "ifElse",
            "for",
            "foreach",
            "while",
            "case",
            "caseCase",
            "repeat",
            "try",
            "exceptionHandler"
        ).forEach { put(it, setOf(Metric.LogicComplexity)) }

        // Logic complexity - conditional (binary expressions with and/or/xor)
        put(
            "exprBinary",
            setOf(
                Metric.LogicComplexityConditional(
                    MetricCondition.ChildFieldMatches(
                        fieldName = "operator",
                        allowedValues = setOf("kAnd", "kOr", "kXor")
                    )
                )
            )
        )

        // Function complexity and counting
        // defProc is a procedure/function implementation and counts for both complexity and function count.
        // declProc (forward declaration in interface section) is NOT counted here.
        put("defProc", setOf(Metric.FunctionComplexity, Metric.Function))

        // Lambda contributes to complexity only (not counted as a function)
        put("lambda", setOf(Metric.FunctionComplexity))

        // Function body (begin..end block)
        put("block", setOf(Metric.FunctionBody))

        // Parameters
        put("declArg", setOf(Metric.Parameter))

        // Comments (covers //, { }, and (* *))
        put("comment", setOf(Metric.CommentLine))

        // Message chains. `exprDot` counts as a call only when it's NOT wrapped in `exprCall`
        // (paren-less `Obj.M1.M2.M3.M4` chains). The wrapped case is double-prevented by
        // `DelphiDefinition.calculationExtensions.ignoreNodeForMessageChainCall`.
        put("exprCall", setOf(Metric.MessageChain, Metric.MessageChainCall))
        put("exprDot", setOf(Metric.MessageChain, Metric.MessageChainCall))
    }
}
