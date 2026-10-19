package de.maibornwolff.treesitter.excavationsite.integration.dependencies

import de.maibornwolff.treesitter.excavationsite.languages.LanguageRegistry
import de.maibornwolff.treesitter.excavationsite.shared.domain.BundlerAlias
import de.maibornwolff.treesitter.excavationsite.shared.domain.DependencyResult
import de.maibornwolff.treesitter.excavationsite.shared.domain.EmbeddedDeclarations
import de.maibornwolff.treesitter.excavationsite.shared.domain.GrammarLibrary
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.FfmSyntaxTree
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.NativeTreeSitter

object DependenciesFacade {
    /**
     * The package, imports and declarations of the given source code, with what the sources in another language it
     * embeds import and declare.
     */
    fun analyze(content: String, language: Language): DependencyResult {
        val definition = LanguageRegistry.getLanguageDefinition(language)
        val mapping = checkNotNull(definition.dependencyMapping) { "No dependency mapping for ${language.name}" }
        val wholeFileGrammar = mapping.grammarOfWholeFile
        val processedContent = if (wholeFileGrammar == null) definition.preprocessor?.invoke(content) ?: content else content
        val grammar = NativeTreeSitter.grammar(wholeFileGrammar ?: LanguageRegistry.getGrammarLibrary(language))
        val embeddedSources = mapping.embeddedSources ?: definition.embeddedSources
        val collected = DependencyCollector(grammar, mapping, embeddedSources).collectDependencies(processedContent)
        val sources = collected.embeddedSources
        return collected.ofFile.copy(
            imports = collected.ofFile.imports + sources.filter { it.owner == null }.flatMap { analyze(it.content, it.language).imports },
            embedded = sources.mapNotNull { source ->
                source.owner?.let { owner ->
                    EmbeddedDeclarations(owner, source.language, analyze(source.content, source.language).declarations)
                }
            }
        )
    }

    fun bundlerAliases(
        configuration: String,
        grammarLibrary: GrammarLibrary,
        extractAliases: (SyntaxNode) -> List<BundlerAlias>
    ): List<BundlerAlias> =
        FfmSyntaxTree.parse(configuration, NativeTreeSitter.grammar(grammarLibrary)).use { it.readReleasingReachedNodes(extractAliases) }
}
