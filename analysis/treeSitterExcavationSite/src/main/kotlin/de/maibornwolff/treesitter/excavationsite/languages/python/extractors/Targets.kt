package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/** The names a Python statement or clause binds as targets: of an assignment, a loop, `with`, `except` and `:=`. */
internal object Targets {
    private const val IDENTIFIER = "identifier"
    private const val ASSIGNMENT = "assignment"
    private const val AUGMENTED_ASSIGNMENT = "augmented_assignment"
    private const val FOR_STATEMENT = "for_statement"
    private const val FOR_IN_CLAUSE = "for_in_clause"
    private const val AS_PATTERN_TARGET = "as_pattern_target"
    private const val NAMED_EXPRESSION = "named_expression"
    private const val LEFT_FIELD = "left"
    private const val NAME_FIELD = "name"
    private val TARGET_GROUPS = setOf("pattern_list", "tuple_pattern", "list_pattern", "list_splat_pattern", "parenthesized_expression")

    fun boundBy(node: SyntaxNode): Sequence<String> = when (node.type) {
        ASSIGNMENT, AUGMENTED_ASSIGNMENT, FOR_STATEMENT, FOR_IN_CLAUSE -> namesOf(node.getChildByFieldName(LEFT_FIELD))
        AS_PATTERN_TARGET -> node.children().flatMap { namesOf(it) }
        NAMED_EXPRESSION -> namesOf(node.getChildByFieldName(NAME_FIELD))
        else -> emptySequence()
    }

    // An attribute or subscript as target binds no name
    private fun namesOf(target: SyntaxNode): Sequence<String> = when {
        target.orNull() == null -> emptySequence()
        target.type == IDENTIFIER -> sequenceOf(target.text)
        target.type in TARGET_GROUPS -> target.children().flatMap { namesOf(it) }
        else -> emptySequence()
    }
}
