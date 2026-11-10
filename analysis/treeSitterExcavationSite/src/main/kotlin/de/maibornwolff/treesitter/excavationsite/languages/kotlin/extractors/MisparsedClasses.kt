package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.ancestors

/**
 * tree-sitter-kotlin reads a class with a body but without constructor, supertype or modifier keyword, written after
 * annotations of which one takes arguments (`@Timeout(1)`, `@Tag`, `class Arena { … }`), as an expression: each
 * annotation a prefix expression around an infix call `class Arena { … }` whose trailing lambda holds the class body.
 */
internal object MisparsedClasses {
    private const val INFIX_EXPRESSION = "infix_expression"
    private const val PREFIX_EXPRESSION = "prefix_expression"
    private const val SIMPLE_IDENTIFIER = "simple_identifier"
    private const val LAMBDA_LITERAL = "lambda_literal"
    private const val ANNOTATION = "annotation"
    private const val INTERFACE_KEYWORD = "interface"
    private val KEYWORDS = setOf("class", INTERFACE_KEYWORD, "object")
    private const val CHILDREN_OF_A_CLASS = 3

    fun isMisparsedClass(node: SyntaxNode): Boolean {
        if (node.type != INFIX_EXPRESSION || node.childCount != CHILDREN_OF_A_CLASS || node.parent.type != PREFIX_EXPRESSION) return false
        val (keyword, name, body) = (0 until CHILDREN_OF_A_CLASS).map { node.getChild(it) }
        return keyword.type == SIMPLE_IDENTIFIER &&
            keyword.text in KEYWORDS &&
            name.type == SIMPLE_IDENTIFIER &&
            body.type == LAMBDA_LITERAL
    }

    fun nameOf(misparsedClass: SyntaxNode): String = misparsedClass.getChild(1).text.trim()

    fun typeOf(misparsedClass: SyntaxNode): DeclarationType =
        if (misparsedClass.getChild(0).text == INTERFACE_KEYWORD) DeclarationType.INTERFACE else DeclarationType.CLASS

    /** The annotations written before the class, which the misparse puts into the prefix expressions around it. */
    fun annotationsOf(misparsedClass: SyntaxNode): List<SyntaxNode> = misparsedClass
        .ancestors()
        .takeWhile { it.type == PREFIX_EXPRESSION }
        .flatMap { prefix -> prefix.children().filter { it.type == ANNOTATION } }
        .toList()

    /** Whether [statements] are the body of a misparsed class rather than the block of a lambda. */
    fun isBody(statements: SyntaxNode): Boolean = statements.parent.type == LAMBDA_LITERAL && isMisparsedClass(statements.parent.parent)
}
