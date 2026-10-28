package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * The top-level code of a PHP file, by "Declarations" of `php.md`: every statement outside the declarations,
 * `namespace`, `use`, `declare` and `define` calls, and inline HTML that is more than whitespace. A file that has some
 * gets one [DeclarationType.SCRIPT] without a name, which uses what that code uses.
 */
internal object TopLevelCode {
    private const val EXPRESSION_STATEMENT = "expression_statement"
    private const val TEXT_INTERPOLATION = "text_interpolation"
    private const val TEXT = "text"
    private const val CLOSING_TAG = "?>"
    private const val OPENING_TAG = "<?php"
    private val NO_CODE = setOf(
        "class_declaration", "interface_declaration", "trait_declaration", "enum_declaration", "function_definition",
        "const_declaration", "namespace_use_declaration", "namespace_definition", "declare_statement", "empty_statement",
        "php_tag", "comment"
    )

    fun scriptOf(blocks: List<NamespaceBlock>): Declaration? {
        val statements = blocks.flatMap { block -> block.statements.filter { isCode(it) } }
        if (statements.isEmpty()) return null
        return Declaration(name = "", type = DeclarationType.SCRIPT, usedTypes = UsedTypeExtractor.extract(statements, blocks))
    }

    private fun isCode(statement: SyntaxNode): Boolean = when (statement.type) {
        in NO_CODE -> false
        TEXT_INTERPOLATION, TEXT ->
            statement.text
                .trim()
                .removePrefix(CLOSING_TAG)
                .removeSuffix(OPENING_TAG)
                .isNotBlank()
        EXPRESSION_STATEMENT -> statement.namedChildren().none { DefineCalls.isDefine(it) }
        else -> true
    }
}
