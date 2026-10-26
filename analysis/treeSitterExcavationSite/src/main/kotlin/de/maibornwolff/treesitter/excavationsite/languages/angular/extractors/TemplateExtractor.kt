package de.maibornwolff.treesitter.excavationsite.languages.angular.extractors

import de.maibornwolff.treesitter.excavationsite.languages.angular.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.angular.PIPE_CALL
import de.maibornwolff.treesitter.excavationsite.shared.domain.AngularDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

/**
 * A template declares nothing of its own, so it is one nameless script declaration. It uses the pipes it names, in
 * source order, which it knows only by their pipe name; which class declares one, the consumer finds out. Its elements,
 * as the compiler matches selectors against them, are its Angular declaration, see [TemplateElements].
 */
internal object TemplateExtractor {
    private const val NO_NAME = ""

    fun extract(rootNode: SyntaxNode): List<Declaration> {
        val usedNames = TreeTraversal
            .findAllDescendantsOfType(rootNode, PIPE_CALL)
            .mapNotNull { TreeTraversal.findFirstChildTextByType(it, IDENTIFIER) }
            .mapTo(LinkedHashSet()) { UsedType(it) }
        val angular = AngularDeclaration(elements = TemplateElements.of(rootNode))
        return listOf(Declaration(name = NO_NAME, type = DeclarationType.SCRIPT, usedTypes = usedNames, angular = angular))
    }
}
