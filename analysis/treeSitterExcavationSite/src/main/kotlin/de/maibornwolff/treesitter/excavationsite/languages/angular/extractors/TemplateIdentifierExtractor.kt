package de.maibornwolff.treesitter.excavationsite.languages.angular.extractors

import de.maibornwolff.treesitter.excavationsite.languages.angular.BINDING_NAME
import de.maibornwolff.treesitter.excavationsite.languages.angular.CLASS_BINDING
import de.maibornwolff.treesitter.excavationsite.languages.angular.MEMBER_EXPRESSION
import de.maibornwolff.treesitter.excavationsite.languages.angular.OPERATOR_FIELD
import de.maibornwolff.treesitter.excavationsite.languages.angular.STRUCTURAL_ASSIGNMENT
import de.maibornwolff.treesitter.excavationsite.languages.angular.STRUCTURAL_DIRECTIVE
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.ancestors

private const val IMPLICIT_VARIABLE_PREFIX = "$"

// The directive name of `*ngIf` and the `class` of `[class.lit]`
private val NAMING_PARENTS = setOf(STRUCTURAL_DIRECTIVE, CLASS_BINDING)

/**
 * Extracts an identifier of a template expression. Left out are the names a binding targets (`[cave]`, `(click)`,
 * `[class.lit]`), which the bound component or element declares, the name of a structural directive, the `of` of
 * `*ngFor`, and Angular's implicit variables such as `$event` and `$index`.
 */
internal fun extractTemplateIdentifier(node: SyntaxNode): String? {
    val identifier = node.text
    val isSyntax = identifier.startsWith(IMPLICIT_VARIABLE_PREFIX) ||
        node.parent.type in NAMING_PARENTS ||
        isBindingTarget(node) ||
        isOfKeyword(node)
    return identifier.takeUnless { isSyntax }
}

private fun isBindingTarget(node: SyntaxNode): Boolean =
    node.ancestors().dropWhile { it.type == MEMBER_EXPRESSION }.firstOrNull()?.type == BINDING_NAME

private fun isOfKeyword(node: SyntaxNode): Boolean {
    val parent = node.parent
    return parent.type == STRUCTURAL_ASSIGNMENT && parent.getChildByFieldName(OPERATOR_FIELD) == node
}
