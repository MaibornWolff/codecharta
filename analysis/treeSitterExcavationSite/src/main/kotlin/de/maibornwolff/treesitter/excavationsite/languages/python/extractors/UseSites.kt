package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.ancestors
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * Whether an identifier in a Python definition uses a name. The name a `def` or `class` declares, a parameter, the
 * keyword of a keyword argument or keyword pattern, an attribute behind a dot and the names of an import, `global` or `nonlocal`
 * statement use none.
 */
internal object UseSites {
    private const val NAME_FIELD = "name"
    private const val ATTRIBUTE_FIELD = "attribute"
    private const val ATTRIBUTE = "attribute"
    private const val TYPED_PARAMETER = "typed_parameter"
    private const val KEYWORD_PATTERN = "keyword_pattern"
    private val NAMED_BY_NAME_FIELD = setOf(
        "class_definition",
        "function_definition",
        "default_parameter",
        "typed_default_parameter",
        "keyword_argument"
    )
    private val PARAMETER_LISTS = setOf("parameters", "lambda_parameters")
    private val SPLAT_PATTERNS = setOf("list_splat_pattern", "dictionary_splat_pattern")
    private val NAME_STATEMENTS = setOf("global_statement", "nonlocal_statement")
    private val IMPORT_PARTS = setOf("dotted_name", "aliased_import")
    private val IMPORTS = setOf("import_statement", "import_from_statement", "future_import_statement")

    fun isUse(identifier: SyntaxNode): Boolean {
        val parent = identifier.parent
        return when (parent.type) {
            in NAMED_BY_NAME_FIELD -> !isField(parent, NAME_FIELD, identifier)
            ATTRIBUTE -> !isField(parent, ATTRIBUTE_FIELD, identifier)
            KEYWORD_PATTERN -> parent.namedChildren().firstOrNull()?.startByte != identifier.startByte
            in PARAMETER_LISTS, TYPED_PARAMETER, in NAME_STATEMENTS -> false
            in SPLAT_PATTERNS -> parent.parent.type !in PARAMETER_LISTS + TYPED_PARAMETER
            in IMPORT_PARTS -> parent.ancestors().none { it.type in IMPORTS }
            else -> true
        }
    }

    private fun isField(parent: SyntaxNode, fieldName: String, identifier: SyntaxNode): Boolean =
        parent.getChildByFieldName(fieldName).orNull()?.startByte == identifier.startByte
}
