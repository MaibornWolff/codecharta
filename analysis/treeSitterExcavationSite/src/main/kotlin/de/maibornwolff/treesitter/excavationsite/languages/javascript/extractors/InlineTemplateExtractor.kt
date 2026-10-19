package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.EmbeddedSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.EmbeddedSourceMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * The inline templates of the Angular components of a file, which are sources in the Angular template language. Each
 * belongs to the class of its component.
 */
internal object InlineTemplateExtractor {
    private const val COMPONENT_DECORATOR = "@Component"
    private val CLASS_TYPES = setOf(CLASS_DECLARATION, ABSTRACT_CLASS_DECLARATION)

    val mapping = EmbeddedSourceMapping(marker = COMPONENT_DECORATOR, extract = ::extract)

    fun extract(rootNode: SyntaxNode): List<EmbeddedSource> = TreeTraversal
        .findAllDescendantsOfType(rootNode, DECORATOR)
        .mapNotNull { decorator ->
            AngularDecoratorExtractor.inlineTemplateOf(decorator)?.let { EmbeddedSource(it, Language.ANGULAR, classNameOf(decorator)) }
        }

    // The decorators of an exported class are children of the export statement, not of the class declaration
    private fun classNameOf(decorator: SyntaxNode): String? {
        val holder = decorator.parent
        val classNode = if (holder.type in CLASS_TYPES) holder else holder.children().firstOrNull { it.type in CLASS_TYPES }
        return classNode?.let { TreeTraversal.findFirstChildTextByType(it, TYPE_IDENTIFIER, IDENTIFIER) }
    }
}
