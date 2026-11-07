package de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors

/**
 * Reads the action rows of a macro, as Access 2007 and older write it: one action per row, run when its condition
 * holds, a condition of `...` continuing the one of the row before; a row with a macro name starts a submacro. The
 * arguments come by position, named as the macro designer names them for the actions whose names CodeCharta reads,
 * else `Argument1`, `Argument2`, …
 */
internal object MacroActionRows {
    private const val MACRO_NAME = "MacroName"
    private const val CONDITION = "Condition"
    private const val ACTION = "Action"
    private const val ARGUMENT = "Argument"
    private const val COMMENT = "Comment"
    private const val CONTINUED_CONDITION = "..."
    private val ARGUMENT_NAMES = mapOf(
        "openform" to listOf("FormName", "View", "FilterName", "WhereCondition", "DataMode", "WindowMode"),
        "openreport" to listOf("ReportName", "View", "FilterName", "WhereCondition", "WindowMode"),
        "openquery" to listOf("QueryName", "View", "DataMode"),
        "opentable" to listOf("TableName", "View", "DataMode"),
        "runcode" to listOf("FunctionName"),
        "runmacro" to listOf("MacroName", "RepeatCount", "RepeatExpression"),
        "msgbox" to listOf("Message", "Beep", "Type", "Title"),
        "settempvar" to listOf("Name", "Expression"),
        "onerror" to listOf("Goto", "MacroName")
    )

    private class Body {
        val statements = mutableListOf<MacroStatement>()
    }

    fun read(rows: List<MacroRow>): Macro {
        val main = Body()
        val submacros = mutableListOf<Pair<String, Body>>()
        rows.forEach { row ->
            row.valueOf(MACRO_NAME)?.let { submacros.add(it to Body()) }
            addRow(row, submacros.lastOrNull()?.second ?: main)
        }
        return Macro(main.statements, submacros.map { (name, body) -> Submacro(name, body.statements) })
    }

    private fun addRow(row: MacroRow, body: Body) {
        row.valueOf(COMMENT)?.let { body.statements.add(MacroComment(it)) }
        val action = row.valueOf(ACTION)?.let { MacroAction(it, argumentsOf(it, row.valuesOf(ARGUMENT))) }
        val condition = row.valueOf(CONDITION)
        val lastConditional = body.statements.lastOrNull() as? MacroConditional
        when {
            condition == CONTINUED_CONDITION && lastConditional != null -> action?.let { continueConditional(body, lastConditional, it) }
            condition != null -> body.statements.add(MacroConditional(listOf(MacroBranch(condition, listOfNotNull(action)))))
            else -> action?.let { body.statements.add(it) }
        }
    }

    private fun continueConditional(body: Body, conditional: MacroConditional, action: MacroAction) {
        val branch = conditional.branches.single()
        body.statements[body.statements.lastIndex] = MacroConditional(listOf(branch.copy(statements = branch.statements + action)))
    }

    private fun argumentsOf(action: String, values: List<String>): Map<String, String> {
        val names = ARGUMENT_NAMES[action.lowercase()].orEmpty()
        return values
            .withIndex()
            .filter { it.value.isNotEmpty() }
            .associate { (position, value) -> (names.getOrNull(position) ?: "$ARGUMENT${position + 1}") to value }
    }
}
