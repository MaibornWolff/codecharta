package de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors

import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaName
import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaNameKind

/**
 * The objects the actions of a macro name: a form, report, query or table by the argument that names it
 * (`FormName`, `FilterName`), a macro by the `MacroName` of `RunMacro`, and any object by the `ObjectType` and
 * `ObjectName` of an action such as `CloseWindow`. The submacro an `OnError` jumps to is a part of the macro itself.
 */
internal object MacroObjects {
    private const val RUN_MACRO = "RunMacro"
    private const val MACRO_NAME = "MacroName"
    private const val OBJECT_TYPE = "ObjectType"
    private const val OBJECT_NAME = "ObjectName"
    private val ARGUMENT_KINDS = mapOf(
        "FormName" to VbaNameKind.FORM,
        "ReportName" to VbaNameKind.REPORT,
        "QueryName" to VbaNameKind.RELATION,
        "TableName" to VbaNameKind.RELATION,
        "FilterName" to VbaNameKind.RELATION
    )
    private val OBJECT_TYPES = mapOf(
        "form" to VbaNameKind.FORM,
        "report" to VbaNameKind.REPORT,
        "query" to VbaNameKind.RELATION,
        "table" to VbaNameKind.RELATION,
        "macro" to VbaNameKind.MACRO
    )

    fun of(macro: Macro): List<VbaName> = (listOf(macro.statements) + macro.submacros.map { it.statements }).flatMap { objectsOf(it) }

    private fun objectsOf(statements: List<MacroStatement>): List<VbaName> = statements.flatMap { statement ->
        when (statement) {
            is MacroAction -> objectsOf(statement)
            is MacroConditional -> statement.branches.flatMap { objectsOf(it.statements) }
            is MacroGroup -> objectsOf(statement.statements)
            is MacroComment -> emptyList()
        }
    }

    private fun objectsOf(action: MacroAction): List<VbaName> {
        val named = action.arguments.mapNotNull { (name, value) -> ARGUMENT_KINDS[name]?.let { VbaName(listOf(value), it) } }
        val macro = action.arguments[MACRO_NAME]?.takeIf { action.name.equals(RUN_MACRO, ignoreCase = true) }
        return named + listOfNotNull(macro?.let { VbaName(listOf(it), VbaNameKind.MACRO) }, typedObjectOf(action))
    }

    private fun typedObjectOf(action: MacroAction): VbaName? {
        val kind = action.arguments[OBJECT_TYPE]?.let { OBJECT_TYPES[it.lowercase()] } ?: return null
        return action.arguments[OBJECT_NAME]?.let { VbaName(listOf(it), kind) }
    }
}
