package de.maibornwolff.treesitter.excavationsite.api

import de.maibornwolff.treesitter.excavationsite.integration.dependencies.DependenciesFacade
import de.maibornwolff.treesitter.excavationsite.languages.LanguageRegistry
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiUnit
import de.maibornwolff.treesitter.excavationsite.languages.javascript.JavascriptDependencyMapping
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustModule
import de.maibornwolff.treesitter.excavationsite.shared.domain.BundlerAlias
import de.maibornwolff.treesitter.excavationsite.shared.domain.ComponentRegistration
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

    /**
     * The Vue components a source registers: the `.component('Name', X)` calls of a JavaScript or TypeScript source,
     * and for a Vue component also the `components` option of its plain script, each script block read in its language.
     */
    fun vueComponentRegistrations(content: String, language: Language): List<ComponentRegistration> =
        DependenciesFacade.componentRegistrations(content, language)

    /**
     * What a Rust source declares and writes at module level: `mod` lines, items with the paths they write, `use`
     * declarations, `impl` blocks and `extern crate`, each at the inline modules around it.
     */
    fun rustModule(content: String): RustModule = DependenciesFacade.rustModule(content)

    /**
     * What a Delphi unit, program or library declares: its name, the entries of its `uses` clauses, and each declaration
     * with its section, the types around it, its members and its base types.
     */
    fun delphiUnit(content: String): DelphiUnit = DependenciesFacade.delphiUnit(content)

    fun isDependencyAnalysisSupported(language: Language): Boolean {
        val definition = LanguageRegistry.getLanguageDefinition(language)
        return definition.isDependencyMappingSupported
    }

    fun getSupportedLanguages(): List<Language> = Language.entries.filter { isDependencyAnalysisSupported(it) }
}
