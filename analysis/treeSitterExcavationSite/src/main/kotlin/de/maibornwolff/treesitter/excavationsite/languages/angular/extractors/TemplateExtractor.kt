package de.maibornwolff.treesitter.excavationsite.languages.angular.extractors

import de.maibornwolff.treesitter.excavationsite.languages.angular.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.angular.PIPE_CALL
import de.maibornwolff.treesitter.excavationsite.languages.angular.SELF_CLOSING_TAG
import de.maibornwolff.treesitter.excavationsite.languages.angular.START_TAG
import de.maibornwolff.treesitter.excavationsite.languages.angular.TAG_NAME
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

/**
 * A template declares nothing of its own, so it is one nameless script declaration. It uses the components and pipes
 * it names, in source order: every custom element, whose name has a hyphen, except Angular's own `ng-` elements, and
 * the name of every pipe. A template knows them only by their selector and pipe name, so these are its used types.
 */
internal object TemplateExtractor {
    private const val CUSTOM_ELEMENT_SEPARATOR = '-'
    private const val ANGULAR_ELEMENT_PREFIX = "ng-"
    private const val NO_NAME = ""

    fun extract(rootNode: SyntaxNode): List<Declaration> {
        val usedNames = TreeTraversal
            .findAllDescendantsOfType(rootNode, START_TAG, SELF_CLOSING_TAG, PIPE_CALL)
            .mapNotNull { usedName(it) }
            .mapTo(LinkedHashSet()) { UsedType(it) }
        return listOf(Declaration(name = NO_NAME, type = DeclarationType.SCRIPT, usedTypes = usedNames))
    }

    private fun usedName(node: SyntaxNode): String? {
        if (node.type == PIPE_CALL) return TreeTraversal.findFirstChildTextByType(node, IDENTIFIER)
        return TreeTraversal.findFirstChildTextByType(node, TAG_NAME)?.lowercase()?.takeIf { isComponentElement(it) }
    }

    private fun isComponentElement(tagName: String): Boolean =
        CUSTOM_ELEMENT_SEPARATOR in tagName && !tagName.startsWith(ANGULAR_ELEMENT_PREFIX)
}
