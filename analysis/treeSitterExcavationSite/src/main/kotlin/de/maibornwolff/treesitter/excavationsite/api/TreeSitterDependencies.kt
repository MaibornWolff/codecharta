package de.maibornwolff.treesitter.excavationsite.api

import de.maibornwolff.treesitter.excavationsite.integration.dependencies.DependenciesFacade
import de.maibornwolff.treesitter.excavationsite.languages.LanguageRegistry
import de.maibornwolff.treesitter.excavationsite.languages.javascript.JavascriptDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.BundlerAlias
import de.maibornwolff.treesitter.excavationsite.shared.domain.DependencyResult
import de.maibornwolff.treesitter.excavationsite.shared.domain.EmbeddedSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration

object TreeSitterDependencies {
    fun analyze(content: String, language: Language): DependencyResult {
        val definition = LanguageRegistry.getLanguageDefinition(language)
        val mapping = definition.dependencyMapping
            ?: throw UnsupportedOperationException(
                "Dependency analysis is not supported for ${language.name}. " +
                    "Supported languages: ${getSupportedLanguages().joinToString { it.name }}"
            )

        val parsesWholeFile = mapping.grammarOfWholeFile != null
        val collected = DependenciesFacade.analyze(
            content = content,
            grammarLibrary = mapping.grammarOfWholeFile ?: LanguageRegistry.getGrammarLibrary(language),
            mapping = mapping,
            preprocessor = if (parsesWholeFile) null else definition.preprocessor
        )
        return collected.ofFile.copy(imports = collected.ofFile.imports + importsOf(collected.embeddedSources))
    }

    private fun importsOf(embeddedSources: List<EmbeddedSource>): List<ImportDeclaration> =
        embeddedSources.flatMap { analyze(it.content, it.language).imports }

    /** The module aliases of a webpack, vite or vue-cli configuration, which is parsed as JavaScript whatever its file ending. */
    fun bundlerAliases(configuration: String): List<BundlerAlias> = DependenciesFacade.bundlerAliases(
        configuration = configuration,
        grammarLibrary = LanguageRegistry.getGrammarLibrary(Language.JAVASCRIPT),
        extractAliases = JavascriptDependencyMapping.extractBundlerAliases
    )

    fun isDependencyAnalysisSupported(language: Language): Boolean {
        val definition = LanguageRegistry.getLanguageDefinition(language)
        return definition.isDependencyMappingSupported
    }

    fun getSupportedLanguages(): List<Language> = Language.entries.filter { isDependencyAnalysisSupported(it) }
}
