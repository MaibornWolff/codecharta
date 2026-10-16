package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.EmbeddedSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.EmbeddedSourceMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/** The inline templates of the Angular components of a file, which are sources in the Angular template language. */
internal object InlineTemplateExtractor {
    private const val COMPONENT_DECORATOR = "@Component"

    val mapping = EmbeddedSourceMapping(marker = COMPONENT_DECORATOR, extract = ::extract)

    fun extract(rootNode: SyntaxNode): List<EmbeddedSource> = TreeTraversal
        .findAllDescendantsOfType(rootNode, DECORATOR)
        .mapNotNull { decorator -> AngularDecoratorExtractor.extract(sequenceOf(decorator))?.inlineTemplate }
        .map { template -> EmbeddedSource(template, Language.ANGULAR) }
}
