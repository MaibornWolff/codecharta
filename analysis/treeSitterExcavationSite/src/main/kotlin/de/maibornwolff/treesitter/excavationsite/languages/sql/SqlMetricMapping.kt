package de.maibornwolff.treesitter.excavationsite.languages.sql

import de.maibornwolff.treesitter.excavationsite.shared.domain.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * SQL metric definitions for the SQL island grammar, the same for every dialect.
 */
object SqlMetricMapping : MetricMapping {
    private const val CONDITION = "condition"
    private const val KIND = "kind"
    private const val TRIGGER = "TRIGGER"
    private const val CREATE = "CREATE"
    private val PROCEDURE_KINDS = setOf("PROCEDURE", "PROC")

    private val BRANCHES_AND_LOOPS = listOf(
        "if_statement",
        "elsif_clause",
        "when_clause",
        "iif_expression",
        "while_statement",
        "loop_statement",
        "for_statement",
        "repeat_statement"
    )

    private val EXCEPTION_HANDLERS = listOf("exception_handler", "catch_block", "handler_declaration")

    // What a routine or an anonymous block creates when it runs, a local procedure included, is no object of the schema
    private val OUTSIDE_ROUTINES = MetricCondition.NoAncestorMatches(setOf("routine_body", "do_block"))

    private fun countedOutsideRoutines(fileMetric: AvailableFileMetrics, vararg conditions: MetricCondition) =
        Metric.Counted(fileMetric, MetricCondition.AllOf(conditions.toList() + OUTSIDE_ROUTINES))

    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        (BRANCHES_AND_LOOPS + EXCEPTION_HANDLERS).forEach { nodeType -> put(nodeType, setOf(Metric.LogicComplexity)) }

        // The grammar makes a node of AND and OR only where they join conditions, not for the AND of BETWEEN
        put("logical_operator", setOf(Metric.LogicComplexity))

        // EXIT WHEN and CONTINUE WHEN branch; a bare EXIT does not
        put("exit_statement", setOf(Metric.LogicComplexityConditional(MetricCondition.ChildFieldMatches(CONDITION, setOf(CONDITION)))))

        // Procedures, functions and triggers with a body; a declaration without one is no function
        put(
            "routine_definition",
            setOf(
                Metric.FunctionComplexity,
                Metric.Function,
                countedOutsideRoutines(
                    AvailableFileMetrics.NUMBER_OF_STORED_PROCEDURES,
                    MetricCondition.ChildFieldMatches(KIND, PROCEDURE_KINDS)
                ),
                countedOutsideRoutines(AvailableFileMetrics.NUMBER_OF_TRIGGERS, MetricCondition.ChildFieldMatches(KIND, setOf(TRIGGER)))
            )
        )
        // A trigger that calls a function has no body of its own; ALTER TRIGGER t DISABLE creates none
        put(
            "routine_declaration",
            setOf(
                countedOutsideRoutines(
                    AvailableFileMetrics.NUMBER_OF_TRIGGERS,
                    MetricCondition.ChildFieldMatches(KIND, setOf(TRIGGER)),
                    MetricCondition.AnyChildMatches(setOf(CREATE))
                )
            )
        )
        put("view_definition", setOf(countedOutsideRoutines(AvailableFileMetrics.NUMBER_OF_VIEWS)))
        put("table_definition", setOf(countedOutsideRoutines(AvailableFileMetrics.NUMBER_OF_TABLES)))
        put("routine_body", setOf(Metric.FunctionBody))
        put("parameter", setOf(Metric.Parameter))

        put("comment", setOf(Metric.CommentLine))
    }
}
