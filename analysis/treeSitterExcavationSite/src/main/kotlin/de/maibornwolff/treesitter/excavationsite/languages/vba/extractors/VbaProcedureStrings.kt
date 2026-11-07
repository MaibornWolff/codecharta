package de.maibornwolff.treesitter.excavationsite.languages.vba.extractors

import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaName
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * The routines code names in a string literal: `Application.Run "modX.Proc"` (also a bare `Run`, the workbook of
 * `'Book.xlsm'!Proc` left out), the procedure of `Application.OnTime` and `Application.OnKey`, a control's
 * `.OnAction = "Proc"`, and the functions an `Eval("Func()")` calls. `CallByName` names a member of a value, which
 * names none.
 */
internal object VbaProcedureStrings {
    private const val APPLICATION = "application"
    private const val ON_ACTION = "onaction"
    private const val EVAL = "eval"
    private const val EVAL_PARAMETER = "StringExpr"
    private const val WORKBOOK_SEPARATOR = '!'
    private const val MEMBER_SEPARATOR = '.'
    private val CALL_IN_TEXT = Regex("""([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\s*\(""")

    private data class ProcedureArgument(val index: Int, val parameterName: String)

    private val RUNNERS = mapOf(
        "run" to ProcedureArgument(0, "Macro"),
        "ontime" to ProcedureArgument(1, "Procedure"),
        "onkey" to ProcedureArgument(1, "Procedure")
    )

    /** The routines the call of the plain chain [callee] names by a string among its [arguments]. */
    fun calledBy(callee: List<String>, arguments: SyntaxNode?): List<VbaName> {
        if (arguments == null || !isApplicationMember(callee)) return emptyList()
        val method = callee.last().lowercase()
        if (method == EVAL) return callsIn(VbaArguments.literalArgument(arguments, 0, EVAL_PARAMETER))
        val runner = RUNNERS[method] ?: return emptyList()
        return listOfNotNull(procedureNamed(VbaArguments.literalArgument(arguments, runner.index, runner.parameterName)))
    }

    /** The routine an `OnAction` [property] is set to, null for any other property or value. */
    fun assignedTo(property: String, value: SyntaxNode): VbaName? =
        if (property.lowercase() == ON_ACTION) procedureNamed(VbaArguments.literalOf(value)) else null

    // The members of Application are global names, so `Run` alone is `Application.Run`
    private fun isApplicationMember(callee: List<String>): Boolean =
        callee.size == 1 || (callee.size == 2 && callee.first().lowercase() == APPLICATION)

    private fun procedureNamed(literal: String?): VbaName? {
        val procedure = literal?.substringAfterLast(WORKBOOK_SEPARATOR)?.trim()?.takeIf { it.isNotEmpty() } ?: return null
        return VbaName(procedure.split(MEMBER_SEPARATOR))
    }

    private fun callsIn(expression: String?): List<VbaName> =
        expression?.let { text -> CALL_IN_TEXT.findAll(text).map { VbaName(it.groupValues[1].split(MEMBER_SEPARATOR)) }.toList() }.orEmpty()
}
