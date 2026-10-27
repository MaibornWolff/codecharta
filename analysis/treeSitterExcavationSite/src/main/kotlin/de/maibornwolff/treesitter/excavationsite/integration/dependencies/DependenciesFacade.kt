package de.maibornwolff.treesitter.excavationsite.integration.dependencies

import de.maibornwolff.treesitter.excavationsite.languages.LanguageRegistry
import de.maibornwolff.treesitter.excavationsite.languages.rust.extractors.ModuleReader
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustModule
import de.maibornwolff.treesitter.excavationsite.languages.vue.VueDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.BundlerAlias
import de.maibornwolff.treesitter.excavationsite.shared.domain.ComponentRegistration
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
        val analyzedSources = collected.embeddedSources.map { it to analyze(it.content, it.language) }
        val ofTheFile = analyzedSources.filter { (source, _) -> source.owner == null }
        return collected.ofFile.copy(
            imports = collected.ofFile.imports + analyzedSources.flatMap { (_, result) -> result.imports },
            declarations = collected.ofFile.declarations + ofTheFile.flatMap { (_, result) -> result.declarations },
            embedded = analyzedSources.mapNotNull { (source, result) ->
                source.owner?.let { owner -> EmbeddedDeclarations(owner, source.language, result.declarations) }
            }
        )
    }

    /** The Vue components a source registers, those of the script blocks of a source that embeds them included. */
    fun componentRegistrations(content: String, language: Language): List<ComponentRegistration> {
        val mapping = LanguageRegistry.getLanguageDefinition(language).dependencyMapping
        val grammar = NativeTreeSitter.grammar(mapping?.grammarOfWholeFile ?: LanguageRegistry.getGrammarLibrary(language))
        return FfmSyntaxTree.parse(content, grammar).use { tree ->
            val sources = mapping?.embeddedSources?.let { tree.readReleasingReachedNodes(it.extract) }.orEmpty()
            tree.readReleasingReachedNodes(VueDependencyMapping.extractComponentRegistrations) +
                sources.flatMap { componentRegistrations(it.content, it.language) }
        }
    }

    /** What a Rust source declares and writes, for the name lookup of `rust.md`. */
    fun rustModule(content: String): RustModule {
        val grammar = NativeTreeSitter.grammar(LanguageRegistry.getGrammarLibrary(Language.RUST))
        return FfmSyntaxTree.parse(content, grammar).use { it.readReleasingReachedNodes(ModuleReader::read) }
    }

    fun bundlerAliases(
        configuration: String,
        grammarLibrary: GrammarLibrary,
        extractAliases: (SyntaxNode) -> List<BundlerAlias>
    ): List<BundlerAlias> =
        FfmSyntaxTree.parse(configuration, NativeTreeSitter.grammar(grammarLibrary)).use { it.readReleasingReachedNodes(extractAliases) }
}
