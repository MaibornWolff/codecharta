package de.maibornwolff.treesitter.excavationsite.languages.vba.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/** The code of every branch of an `#If`, without its conditions, which name compiler constants and never the code. */
internal object VbaConditionalCode {
    private const val PREPROCESSOR_IF = "preprocessor_if"
    private const val PREPROCESSOR_ELSEIF = "preprocessor_elseif"
    private const val PREPROCESSOR_ELSE = "preprocessor_else"
    private const val PREPROCESSOR_BLOCK = "preprocessor_block"
    private const val PREPROCESSOR_CONST = "preprocessor_const"
    private const val NEWLINE = "newline"

    private val BRANCHES = setOf(PREPROCESSOR_IF, PREPROCESSOR_ELSEIF, PREPROCESSOR_ELSE)
    private val CODE_OF_BRANCH = setOf(PREPROCESSOR_BLOCK, PREPROCESSOR_ELSEIF, PREPROCESSOR_ELSE)

    fun isConditional(node: SyntaxNode): Boolean = node.type in BRANCHES || node.type == PREPROCESSOR_BLOCK

    /** The code inside [conditional], a branch or a block of one. */
    fun codeOf(conditional: SyntaxNode): List<SyntaxNode> = if (conditional.type == PREPROCESSOR_BLOCK) {
        conditional.children().toList()
    } else {
        conditional.children().filter { it.type in CODE_OF_BRANCH }.toList()
    }

    /** The children of [node], with the code of each `#If` in place of the `#If`, and no line breaks or `#Const`. */
    fun itemsOf(node: SyntaxNode): List<SyntaxNode> = node.children().flatMap { flattened(it) }.toList()

    private fun flattened(node: SyntaxNode): Sequence<SyntaxNode> = when {
        node.type == NEWLINE || node.type == PREPROCESSOR_CONST -> emptySequence()
        isConditional(node) -> codeOf(node).asSequence().flatMap { flattened(it) }
        else -> sequenceOf(node)
    }
}
