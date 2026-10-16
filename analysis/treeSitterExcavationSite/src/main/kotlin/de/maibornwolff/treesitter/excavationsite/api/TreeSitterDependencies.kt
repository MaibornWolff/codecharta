package de.maibornwolff.treesitter.excavationsite.api

import de.maibornwolff.treesitter.excavationsite.integration.dependencies.DependenciesFacade
import de.maibornwolff.treesitter.excavationsite.languages.LanguageRegistry
import de.maibornwolff.treesitter.excavationsite.languages.javascript.JavascriptDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.BundlerAlias
import de.maibornwolff.treesitter.excavationsite.shared.domain.DependencyResult

object TreeSitterDependencies {
    fun analyze(content: String, language: Language): DependencyResult {
        if (!isDependencyAnalysisSupported(language)) {
            throw UnsupportedOperationException(
                "Dependency analysis is not supported for ${language.name}. " +
                    "Supported languages: ${getSupportedLanguages().joinToString { it.name }}"
            )
        }
        return DependenciesFacade.analyze(content, language)
    }

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
