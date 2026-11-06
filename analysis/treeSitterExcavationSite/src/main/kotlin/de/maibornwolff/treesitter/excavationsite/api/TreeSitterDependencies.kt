package de.maibornwolff.treesitter.excavationsite.api

import de.maibornwolff.treesitter.excavationsite.integration.dependencies.DependenciesFacade
import de.maibornwolff.treesitter.excavationsite.languages.LanguageRegistry
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiUnit
import de.maibornwolff.treesitter.excavationsite.languages.javascript.JavascriptDependencyMapping
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustModule
import de.maibornwolff.treesitter.excavationsite.languages.sql.model.AccessQuery
import de.maibornwolff.treesitter.excavationsite.languages.sql.model.SqlScript
import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaModule
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

    /**
     * What a SQL file creates and changes, each object with its schema, its members and the names it writes with the
     * kind of object they ask for, and the names of the statements outside every object with their default schema.
     */
    fun sqlScript(content: String): SqlScript = DependenciesFacade.sqlScript(content)

    /** What an Access query names: its tables, queries and functions, and the forms and reports of its bang chains. */
    fun accessQuery(content: String): AccessQuery = DependenciesFacade.accessQuery(content)

    /** What the layout of an Access form or report names: its data sources, subforms, expressions and SQL, see [AccessLayout]. */
    fun accessLayout(content: String): AccessLayout = DependenciesFacade.accessLayout(content)

    /** What a VBA module or class, or a VB6 form, declares and names, see [VbaModule]. */
    fun vbaModule(content: String, language: Language): VbaModule = DependenciesFacade.vbaModule(content, language)

    fun isDependencyAnalysisSupported(language: Language): Boolean {
        val definition = LanguageRegistry.getLanguageDefinition(language)
        return definition.isDependencyMappingSupported
    }

    fun getSupportedLanguages(): List<Language> = Language.entries.filter { isDependencyAnalysisSupported(it) }
}
