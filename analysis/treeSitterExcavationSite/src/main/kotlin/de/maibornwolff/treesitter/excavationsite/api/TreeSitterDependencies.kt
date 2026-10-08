package de.maibornwolff.treesitter.excavationsite.api

import de.maibornwolff.treesitter.excavationsite.integration.dependencies.DependenciesFacade
import de.maibornwolff.treesitter.excavationsite.languages.LanguageRegistry
import de.maibornwolff.treesitter.excavationsite.shared.domain.DependencyResult

object TreeSitterDependencies {
    fun analyze(content: String, language: Language): DependencyResult {
        val definition = LanguageRegistry.getLanguageDefinition(language)
        val mapping = definition.dependencyMapping
            ?: throw UnsupportedOperationException(
                "Dependency analysis is not supported for ${language.name}. " +
                    "Supported languages: ${getSupportedLanguages().joinToString { it.name }}"
            )

        val collected = DependenciesFacade.analyze(
            content = content,
            grammarLibrary = mapping.grammarOfWholeFile ?: LanguageRegistry.getGrammarLibrary(language),
            mapping = mapping,
            preprocessor = definition.preprocessor.takeIf { mapping.grammarOfWholeFile == null }
        )
        val importsOfEmbeddedSources = collected.embeddedSources.flatMap { analyze(it.content, it.language).imports }
        return collected.ofFile.copy(imports = collected.ofFile.imports + importsOfEmbeddedSources)
    }

    fun isDependencyAnalysisSupported(language: Language): Boolean {
        val definition = LanguageRegistry.getLanguageDefinition(language)
        return definition.isDependencyMappingSupported
    }

    fun getSupportedLanguages(): List<Language> = Language.entries.filter { isDependencyAnalysisSupported(it) }
}
