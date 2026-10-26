package de.maibornwolff.treesitter.excavationsite.languages.angular.extractors

import de.maibornwolff.treesitter.excavationsite.languages.angular.ALIAS_FIELD
import de.maibornwolff.treesitter.excavationsite.languages.angular.ATTRIBUTE
import de.maibornwolff.treesitter.excavationsite.languages.angular.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.angular.LET_KEYWORD
import de.maibornwolff.treesitter.excavationsite.languages.angular.NAME_FIELD
import de.maibornwolff.treesitter.excavationsite.languages.angular.OPERATOR_FIELD
import de.maibornwolff.treesitter.excavationsite.languages.angular.SPECIAL_KEYWORD
import de.maibornwolff.treesitter.excavationsite.languages.angular.STRUCTURAL_ASSIGNMENT
import de.maibornwolff.treesitter.excavationsite.languages.angular.STRUCTURAL_DECLARATION
import de.maibornwolff.treesitter.excavationsite.languages.angular.STRUCTURAL_DIRECTIVE
import de.maibornwolff.treesitter.excavationsite.languages.angular.STRUCTURAL_EXPRESSION
import de.maibornwolff.treesitter.excavationsite.shared.domain.AngularSelector
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.fieldOfType
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * A structural directive `*x="…"` wraps its element in an `ng-template` element, which the compiler matches selectors
 * against by the attribute `x` and, per key of the microsyntax, `x` with that key capitalized: `of` and `trackBy` in
 * `let a of b; trackBy: f`, `else` in `c; else t`. A template variable (`let i = index`, `index as i`) is no key.
 */
internal object StructuralDirectives {
    private const val NG_TEMPLATE = "ng-template"
    private const val AS_KEYWORD = "as"
    private const val KEY_SEPARATOR = ":"
    private const val STATEMENT_SEPARATOR = ";"
    private const val NO_VALUE = ""

    fun templatesOf(tag: SyntaxNode): List<AngularSelector> = tag
        .children()
        .filter { it.type == ATTRIBUTE }
        .mapNotNull { attribute -> attribute.children().firstOrNull { it.type == STRUCTURAL_DIRECTIVE } }
        .mapNotNull { templateOf(it) }
        .toList()

    private fun templateOf(directive: SyntaxNode): AngularSelector? {
        val name = directive.children().firstOrNull { it.type == IDENTIFIER }?.text ?: return null
        val keyAttributes = keysOf(directive).map { key -> name + key.replaceFirstChar { it.uppercaseChar() } }
        return AngularSelector(element = NG_TEMPLATE, attributes = (listOf(name) + keyAttributes).associateWith { NO_VALUE })
    }

    private fun keysOf(directive: SyntaxNode): List<String> {
        val microsyntax = directive.children().firstOrNull { it.type == STRUCTURAL_DECLARATION || it.type == STRUCTURAL_EXPRESSION }
        return when (microsyntax?.type) {
            STRUCTURAL_DECLARATION -> microsyntax.children().filter { it.type == STRUCTURAL_ASSIGNMENT }.mapNotNull { keyOf(it) }.toList()
            STRUCTURAL_EXPRESSION -> keysAfterExpression(microsyntax)
            else -> emptyList()
        }
    }

    // `of` in `let a of b`, `trackBy` in `trackBy: f`; `let a = b` (operator `=`) and `index as i` bind a variable
    private fun keyOf(assignment: SyntaxNode): String? {
        assignment.fieldOfType(OPERATOR_FIELD, IDENTIFIER)?.let { return it.text }
        val bindsVariable = isLet(assignment.prevSibling) ||
            assignment.children().any { isLet(it) } ||
            assignment.getChildByFieldName(ALIAS_FIELD).orNull() != null
        return if (bindsVariable) null else assignment.getChildByFieldName(NAME_FIELD).orNull()?.text
    }

    // `else` in `c; else t`, `context` in `t; context: c`, but not the alias of `c as a`
    private fun keysAfterExpression(microsyntax: SyntaxNode): List<String> {
        val parts = microsyntax.children().toList()
        return parts
            .withIndex()
            .filter { (index, part) -> parts.take(index).any { it.text == STATEMENT_SEPARATOR } && isKey(part, parts.getOrNull(index + 1)) }
            .map { it.value.text }
    }

    private fun isKey(part: SyntaxNode, next: SyntaxNode?): Boolean =
        (part.type == SPECIAL_KEYWORD && part.text != AS_KEYWORD) || (part.type == IDENTIFIER && next?.text == KEY_SEPARATOR)

    private fun isLet(node: SyntaxNode): Boolean = !node.isNull && node.type == SPECIAL_KEYWORD && node.text == LET_KEYWORD
}
