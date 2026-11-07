package de.maibornwolff.treesitter.excavationsite.languages.vba.extractors

import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaName
import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaNameKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * The Access forms, reports, queries and tables code names by a literal: the collections (`Forms!x`, `Forms("x")`,
 * `Reports`, a project's `AllForms` and `AllReports`, `OpenRecordset("x")`, `QueryDefs("x")`), the `DoCmd` methods
 * ([VbaDoCmd]), the domain functions (`DLookup("Field", "qryX")`) and a row or record source set to a name. A name held
 * in a variable, and SQL text in place of a name, names none.
 */
internal object VbaAccessObjects {
    private const val DOMAIN_PARAMETER = "Domain"
    private const val DOMAIN_ARGUMENT_INDEX = 1
    private const val BRACKET_OPEN = "["
    private const val BRACKET_CLOSE = "]"

    private val COLLECTIONS = mapOf("forms" to VbaNameKind.FORM, "reports" to VbaNameKind.REPORT)
    private val PROJECT_COLLECTIONS = mapOf(
        "allforms" to VbaNameKind.FORM,
        "allreports" to VbaNameKind.REPORT,
        "openrecordset" to VbaNameKind.RELATION,
        "querydefs" to VbaNameKind.RELATION
    )
    private val DOMAIN_FUNCTIONS = setOf("dlookup", "dcount", "dsum", "dmax", "dmin", "davg", "dfirst", "dlast")
    private val SOURCE_PROPERTIES = setOf("rowsource", "recordsource")

    /** The object `Forms!member` or `Reports!member` names, also written in brackets (`[Forms]![member]`), null for any other [collection]. */
    fun namedBy(collection: String, member: String): VbaName? =
        COLLECTIONS[unbracketed(collection).lowercase()]?.let { VbaName(listOf(unbracketed(member)), it) }

    private fun unbracketed(name: String): String = name.removeSurrounding(BRACKET_OPEN, BRACKET_CLOSE)

    /** The object a call of the plain chain [callee] opens or names with [arguments], null for any other call. */
    fun openedBy(callee: List<String>, arguments: SyntaxNode?): VbaName? {
        if (arguments == null || callee.isEmpty()) return null
        val collection = collectionOf(callee)
        return when {
            collection != null -> VbaArguments.named(VbaArguments.positionalLiteral(arguments, 0), collection)
            callee.last().lowercase() in DOMAIN_FUNCTIONS ->
                VbaArguments.named(VbaArguments.literalArgument(arguments, DOMAIN_ARGUMENT_INDEX, DOMAIN_PARAMETER), VbaNameKind.RELATION)
            else -> VbaDoCmd.objectOf(callee, arguments)
        }
    }

    /** The query or table a row or record source is set to, null for any other [property] or value. */
    fun assignedTo(property: String, value: SyntaxNode): VbaName? {
        if (property.lowercase() !in SOURCE_PROPERTIES) return null
        return VbaArguments.named(VbaArguments.literalOf(value), VbaNameKind.RELATION)
    }

    // `CurrentProject.AllForms` names the forms of a project; a bare `AllForms` is no Access name.
    private fun collectionOf(callee: List<String>): VbaNameKind? {
        if (callee.size == 1) return COLLECTIONS[callee.single().lowercase()]
        return PROJECT_COLLECTIONS[callee.last().lowercase()]
    }
}
