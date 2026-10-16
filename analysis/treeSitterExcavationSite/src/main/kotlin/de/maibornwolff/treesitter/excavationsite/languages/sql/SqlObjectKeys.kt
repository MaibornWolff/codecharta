package de.maibornwolff.treesitter.excavationsite.languages.sql

import de.maibornwolff.treesitter.excavationsite.languages.sql.extractors.SqlNames
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The keys that tell the SQL objects a file creates apart, so that an object created and then altered counts once.
 * A key is the object's name, compared like [SqlNames.comparablePartsOf] and without its schema (dbo.p1 and p1 are one
 * procedure), qualified by the definitions around it such as its package, and for a routine the types of its
 * parameters, as routines of one name and other parameter types are overloads of their own.
 */
internal object SqlObjectKeys {
    private const val PARAMETER_LIST = "parameter_list"
    private const val PARAMETER = "parameter"
    private const val NAME_FIELD = "name"
    private const val QUALIFIER_SEPARATOR = "/"
    private const val PARAMETER_SEPARATOR = ","
    private val DEFAULT_VALUE = Regex(":?=|\\bdefault\\b", RegexOption.IGNORE_CASE)
    private val WHITESPACE = Regex("\\s+")

    fun objectKey(node: SyntaxNode): String? {
        val name = objectNameOf(node) ?: return null
        val qualifiers = generateSequence(node.parent.orNull()) { it.parent.orNull() }.mapNotNull { objectNameOf(it) }.toList()
        return (qualifiers.reversed() + name).joinToString(QUALIFIER_SEPARATOR) + parameterTypesOf(node)
    }

    private fun objectNameOf(node: SyntaxNode): String? = SqlNames.nameNodeOf(node)?.let { SqlNames.comparablePartsOf(it).lastOrNull() }

    private fun parameterTypesOf(node: SyntaxNode): String {
        val parameterList = node.children().firstOrNull { it.type == PARAMETER_LIST } ?: return ""
        return parameterList.namedChildren().filter { it.type == PARAMETER }.joinToString(PARAMETER_SEPARATOR, "(", ")") { typeOf(it) }
    }

    // The type follows the name and goes up to a default value: p_amount IN NUMBER := 0 has the type NUMBER
    private fun typeOf(parameter: SyntaxNode): String {
        val name = parameter.getChildByFieldName(NAME_FIELD).orNull() ?: return ""
        val type = parameter.text.substringAfter(name.text).split(DEFAULT_VALUE).first()
        return type.trim().replace(WHITESPACE, " ").lowercase()
    }
}
