package de.maibornwolff.treesitter.excavationsite.languages.sql

import de.maibornwolff.treesitter.excavationsite.languages.sql.extractors.SqlNames
import de.maibornwolff.treesitter.excavationsite.shared.domain.ObjectKey
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The keys that tell the SQL objects a file creates apart, so that an object created and then altered counts once.
 * A key holds the object's name, compared like [SqlNames.comparablePartsOf] and qualified by the definitions around
 * it such as its package, and the schema the file writes it with. A trigger adds the table it is on, as PostgreSQL
 * names triggers per table; a routine adds the types of its parameters, as routines of one name and other parameter
 * types are overloads of their own, except in T-SQL, which has no overloads.
 */
internal object SqlObjectKeys {
    private const val PARAMETER_LIST = "parameter_list"
    private const val PARAMETER = "parameter"
    private const val NAME_FIELD = "name"
    private const val TABLE_FIELD = "table"
    private const val VARIABLE = "variable"
    private const val OPENING_PARENTHESIS = "("
    private const val QUALIFIER_SEPARATOR = "/"
    private const val TABLE_SEPARATOR = " on "
    private const val PARAMETER_SEPARATOR = ","
    private val MODES = setOf("in", "out", "inout", "nocopy", "variadic", "output", "readonly", "as")
    private val DEFAULT_MARKERS = setOf("=", ":=", "default")
    private val WHITESPACE = Regex("\\s+")

    fun objectKey(node: SyntaxNode): ObjectKey? {
        val nameParts = SqlNames.nameNodeOf(node)?.let { SqlNames.comparablePartsOf(it) }?.takeIf { it.isNotEmpty() } ?: return null
        val qualifiers = generateSequence(node.parent.orNull()) { it.parent.orNull() }.mapNotNull { objectNameOf(it) }.toList()
        val name = (qualifiers.reversed() + nameParts.last()).joinToString(QUALIFIER_SEPARATOR)
        return ObjectKey(name + tableOf(node) + parameterTypesOf(node), nameParts.dropLast(1).lastOrNull())
    }

    private fun objectNameOf(node: SyntaxNode): String? = SqlNames.nameNodeOf(node)?.let { SqlNames.comparablePartsOf(it).lastOrNull() }

    private fun tableOf(node: SyntaxNode): String {
        val table = node.getChildByFieldName(TABLE_FIELD).orNull()?.let { objectNameOf(it) } ?: return ""
        return TABLE_SEPARATOR + table
    }

    private fun parameterTypesOf(node: SyntaxNode): String {
        val parameterList = node.children().firstOrNull { it.type == PARAMETER_LIST } ?: return ""
        val parameters = parameterList.namedChildren().filter { it.type == PARAMETER }.toList()
        if (parameters.any { it.getChildByFieldName(NAME_FIELD).orNull()?.type == VARIABLE }) return ""
        return parameters.joinToString(PARAMETER_SEPARATOR, "(", ")") { typeOf(it) }
    }

    // What follows the name up to a default value, without modes: a IN OUT NOCOPY NUMBER := 0 has the type NUMBER.
    // An unnamed PostgreSQL parameter, f(int) or f(varchar(10)), has its type where the name would be.
    private fun typeOf(parameter: SyntaxNode): String {
        val name = parameter.getChildByFieldName(NAME_FIELD).orNull() ?: return ""
        val typeParts = parameter
            .children()
            .filter { it.startByte >= name.endByte }
            .takeWhile { it.text.lowercase() !in DEFAULT_MARKERS }
            .filterNot { it.text.lowercase() in MODES }
            .map { it.text }
            .toList()
        val isUnnamed = typeParts.isEmpty() || typeParts.first() == OPENING_PARENTHESIS
        val type = if (isUnnamed) listOf(name.text) + typeParts else typeParts
        return type.joinToString("").replace(WHITESPACE, "").lowercase()
    }
}
