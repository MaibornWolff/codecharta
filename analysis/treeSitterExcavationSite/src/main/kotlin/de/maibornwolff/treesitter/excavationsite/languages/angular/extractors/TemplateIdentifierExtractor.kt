package de.maibornwolff.treesitter.excavationsite.languages.angular.extractors

import de.maibornwolff.treesitter.excavationsite.languages.angular.BINDING_NAME
import de.maibornwolff.treesitter.excavationsite.languages.angular.CALL_EXPRESSION
import de.maibornwolff.treesitter.excavationsite.languages.angular.CLASS_BINDING
import de.maibornwolff.treesitter.excavationsite.languages.angular.DEFER_TRIGGER_CONDITION
import de.maibornwolff.treesitter.excavationsite.languages.angular.MEMBER_EXPRESSION
import de.maibornwolff.treesitter.excavationsite.languages.angular.OPERATOR_FIELD
import de.maibornwolff.treesitter.excavationsite.languages.angular.PIPE_CALL
import de.maibornwolff.treesitter.excavationsite.languages.angular.SPECIAL_KEYWORD
import de.maibornwolff.treesitter.excavationsite.languages.angular.STRUCTURAL_ASSIGNMENT
import de.maibornwolff.treesitter.excavationsite.languages.angular.STRUCTURAL_DIRECTIVE
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.ancestors
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

private const val IMPLICIT_VARIABLE_PREFIX = "$"
private const val NAME_FIELD = "name"
private const val FUNCTION_FIELD = "function"
private const val ALIAS_FIELD = "alias"
private const val LET_KEYWORD = "let"

// The directive name of `*ngIf`, the `class` of `[class.lit]` and the name of a pipe
private val NAMING_PARENTS = setOf(STRUCTURAL_DIRECTIVE, CLASS_BINDING, PIPE_CALL)

/**
 * Extracts an identifier of a template expression. Left out are Angular's own names: the names a binding targets
 * (`[cave]`, `(click)`, `[class.lit]`), which the bound component or element declares, the name of a structural
 * directive and of a pipe, the triggers of a `@defer` block, the keys and exported values of a structural directive
 * (the `of` and `trackBy` of `*ngFor`, its `index` and `odd`), and the implicit variables such as `$event` and `$index`.
 */
internal fun extractTemplateIdentifier(node: SyntaxNode): String? {
    val identifier = node.text
    val isSyntax = identifier.startsWith(IMPLICIT_VARIABLE_PREFIX) ||
        node.parent.type in NAMING_PARENTS ||
        isBindingTarget(node) ||
        isDeferTrigger(node) ||
        isDirectiveName(node)
    return identifier.takeUnless { isSyntax }
}

private fun isBindingTarget(node: SyntaxNode): Boolean =
    node.ancestors().dropWhile { it.type == MEMBER_EXPRESSION }.firstOrNull()?.type == BINDING_NAME

private fun isDeferTrigger(node: SyntaxNode): Boolean {
    val trigger = if (node.parent.type == CALL_EXPRESSION && node.parent.getChildByFieldName(FUNCTION_FIELD) == node) node.parent else node
    return trigger.parent.type == DEFER_TRIGGER_CONDITION
}

// In `let item of items; trackBy: byId; let i = index; odd as isOdd` the directive names `of`, `trackBy`, `index`, `odd`
private fun isDirectiveName(node: SyntaxNode): Boolean {
    val assignment = node.ancestors().firstOrNull { it.type == STRUCTURAL_ASSIGNMENT } ?: return false
    val isLocalDeclaration = assignment.children().any { it.type == SPECIAL_KEYWORD && it.text == LET_KEYWORD }
    val operator = assignment.getChildByFieldName(OPERATOR_FIELD).orNull()
    return when (node) {
        operator -> true
        assignment.getChildByFieldName(NAME_FIELD) -> !isLocalDeclaration && operator == null
        assignment.getChildByFieldName(ALIAS_FIELD) -> false
        else -> isLocalDeclaration
    }
}
