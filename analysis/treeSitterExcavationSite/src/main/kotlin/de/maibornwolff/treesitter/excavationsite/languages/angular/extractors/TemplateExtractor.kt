package de.maibornwolff.treesitter.excavationsite.languages.angular.extractors

import de.maibornwolff.treesitter.excavationsite.languages.angular.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.angular.PIPE_CALL
import de.maibornwolff.treesitter.excavationsite.languages.angular.SELF_CLOSING_TAG
import de.maibornwolff.treesitter.excavationsite.languages.angular.START_TAG
import de.maibornwolff.treesitter.excavationsite.languages.angular.TAG_NAME
import de.maibornwolff.treesitter.excavationsite.shared.domain.AngularDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

/**
 * A template declares nothing of its own, so it is one nameless script declaration. It uses the components and pipes
 * it names, in source order: every element except Angular's own `ng-container`, `ng-template` and `ng-content`, as a
 * selector needs no hyphen (`selector: 'creature'`), and the name of every pipe. A template knows them only by their
 * selector and pipe name, so these are its used types; which of them a component or pipe declares, the consumer finds
 * out. Its elements, as the compiler matches selectors against them, are its Angular declaration, see [TemplateElements].
 */
internal object TemplateExtractor {
    private val ANGULAR_ELEMENTS = setOf("ng-container", "ng-template", "ng-content")
    private const val NO_NAME = ""

    fun extract(rootNode: SyntaxNode): List<Declaration> {
        val usedNames = TreeTraversal
            .findAllDescendantsOfType(rootNode, START_TAG, SELF_CLOSING_TAG, PIPE_CALL)
            .mapNotNull { usedName(it) }
            .mapTo(LinkedHashSet()) { UsedType(it) }
        val angular = AngularDeclaration(elements = TemplateElements.of(rootNode))
        return listOf(Declaration(name = NO_NAME, type = DeclarationType.SCRIPT, usedTypes = usedNames, angular = angular))
    }

    private fun usedName(node: SyntaxNode): String? {
        if (node.type == PIPE_CALL) return TreeTraversal.findFirstChildTextByType(node, IDENTIFIER)
        return TreeTraversal.findFirstChildTextByType(node, TAG_NAME)?.lowercase()?.takeIf { it !in ANGULAR_ELEMENTS }
    }
}
