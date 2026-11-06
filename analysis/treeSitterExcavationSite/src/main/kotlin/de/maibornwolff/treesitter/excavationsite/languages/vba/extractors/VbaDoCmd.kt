package de.maibornwolff.treesitter.excavationsite.languages.vba.extractors

import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaName
import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaNameKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * The object a `DoCmd` method names by a literal: `OpenForm`, `OpenReport`, `OpenQuery` and `RunMacro` by their first argument,
 * and the methods that take an object type and a name (`DoCmd.Close acForm, "frmX"`, `OutputTo acOutputQuery, "qryX"`)
 * by the type their first argument is a constant of.
 */
internal object VbaDoCmd {
    private const val DO_CMD = "docmd"
    private const val OBJECT_TYPE_PARAMETER = "ObjectType"
    private const val OBJECT_NAME_PARAMETER = "ObjectName"
    private const val TYPE_ARGUMENT_INDEX = 0
    private const val NAME_ARGUMENT_INDEX = 1

    private data class Opener(val kind: VbaNameKind, val parameterName: String)

    private val OPENERS = mapOf(
        "openform" to Opener(VbaNameKind.FORM, "FormName"),
        "openreport" to Opener(VbaNameKind.REPORT, "ReportName"),
        "openquery" to Opener(VbaNameKind.RELATION, "QueryName"),
        "runmacro" to Opener(VbaNameKind.MACRO, "MacroName")
    )
    private val TYPED_OBJECT_METHODS = setOf("close", "outputto", "selectobject", "deleteobject", "sendobject", "save")
    private val TYPE_CONSTANT_PREFIXES = listOf("acoutput", "acsend", "ac")
    private val OBJECT_TYPES = mapOf(
        "form" to VbaNameKind.FORM,
        "report" to VbaNameKind.REPORT,
        "query" to VbaNameKind.RELATION,
        "table" to VbaNameKind.RELATION,
        "macro" to VbaNameKind.MACRO
    )

    /** The object the `DoCmd` call of the chain [callee] names with [arguments], null for any other call. */
    fun objectOf(callee: List<String>, arguments: SyntaxNode): VbaName? {
        if (callee.size < 2 || !callee[callee.size - 2].equals(DO_CMD, ignoreCase = true)) return null
        val method = callee.last().lowercase()
        val opener = OPENERS[method]
        return when {
            opener != null -> VbaArguments.named(VbaArguments.literalArgument(arguments, 0, opener.parameterName), opener.kind)
            method in TYPED_OBJECT_METHODS -> typedObjectOf(arguments)
            else -> null
        }
    }

    private fun typedObjectOf(arguments: SyntaxNode): VbaName? {
        val typeConstant = VbaArguments.argument(arguments, TYPE_ARGUMENT_INDEX, OBJECT_TYPE_PARAMETER)?.text ?: return null
        val kind = kindOf(typeConstant) ?: return null
        return VbaArguments.named(VbaArguments.literalArgument(arguments, NAME_ARGUMENT_INDEX, OBJECT_NAME_PARAMETER), kind)
    }

    private fun kindOf(typeConstant: String): VbaNameKind? {
        val constant = typeConstant.lowercase()
        val prefix = TYPE_CONSTANT_PREFIXES.firstOrNull { constant.startsWith(it) } ?: return null
        return OBJECT_TYPES[constant.removePrefix(prefix)]
    }
}
