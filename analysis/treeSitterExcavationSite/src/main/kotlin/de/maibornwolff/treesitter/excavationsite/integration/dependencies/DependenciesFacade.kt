package de.maibornwolff.treesitter.excavationsite.integration.dependencies

import de.maibornwolff.treesitter.excavationsite.languages.LanguageRegistry
import de.maibornwolff.treesitter.excavationsite.languages.accesslayout.AccessLayoutComposer
import de.maibornwolff.treesitter.excavationsite.languages.accesslayout.extractors.LayoutLogicReader
import de.maibornwolff.treesitter.excavationsite.languages.accesslayout.model.AccessLayout
import de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors.UnitReader
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiUnit
import de.maibornwolff.treesitter.excavationsite.languages.rust.extractors.ModuleReader
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustModule
import de.maibornwolff.treesitter.excavationsite.languages.sql.extractors.AccessQueryReader
import de.maibornwolff.treesitter.excavationsite.languages.sql.extractors.ScriptReader
import de.maibornwolff.treesitter.excavationsite.languages.sql.model.AccessQuery
import de.maibornwolff.treesitter.excavationsite.languages.sql.model.SqlScript
import de.maibornwolff.treesitter.excavationsite.languages.vba.extractors.VbaModuleReader
import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaModule
import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaName
import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaNameKind
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
    private val VBA_LANGUAGES = setOf(Language.VBA, Language.VB6)
    private const val FIELD_OR_CONTROL_START = "["

    /**
     * The package, imports and declarations of the given source code, with what the sources in another language it
     * embeds import and declare.
     */
    fun analyze(content: String, language: Language): DependencyResult {
        val definition = LanguageRegistry.getLanguageDefinition(language)
        val mapping = checkNotNull(definition.dependencyMapping) { "No dependency mapping for ${language.name}" }
        val wholeFileGrammar = mapping.grammarOfWholeFile
        val ofLanguage = if (wholeFileGrammar == null) definition.preprocessor?.invoke(content) ?: content else content
        val processedContent = mapping.preprocessor?.invoke(ofLanguage) ?: ofLanguage
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

    /** What a Delphi source declares, for the name lookup of `delphi.md`. */
    fun delphiUnit(content: String): DelphiUnit {
        val grammar = NativeTreeSitter.grammar(LanguageRegistry.getGrammarLibrary(Language.DELPHI))
        val processedContent =
            LanguageRegistry.getLanguageDefinition(Language.DELPHI).dependencyMapping?.preprocessor?.invoke(content) ?: content
        return FfmSyntaxTree.parse(processedContent, grammar).use { it.readReleasingReachedNodes(UnitReader::read) }
    }

    /** What a SQL file creates, changes and names, for the name lookup of `sql.md`. */
    fun sqlScript(content: String): SqlScript {
        val grammar = NativeTreeSitter.grammar(LanguageRegistry.getGrammarLibrary(Language.SQL))
        return FfmSyntaxTree.parse(content, grammar).use { it.readReleasingReachedNodes(ScriptReader::read) }
    }

    /** What an Access query names, for the name lookup of `vba.md`, read with the SQL grammar. */
    fun accessQuery(content: String): AccessQuery {
        val grammar = NativeTreeSitter.grammar(LanguageRegistry.getGrammarLibrary(Language.SQL))
        return FfmSyntaxTree.parse(content, grammar).use { it.readReleasingReachedNodes(AccessQueryReader::read) }
    }

    /**
     * What an Access form or report layout names, for the name lookup of `vba.md`: its expressions read as one VBA
     * routine, whose own name and variable are no names of the layout, nor is a name in brackets, a field or control
     * (`[Total]`); and the SQL of its sources as Access queries.
     */
    fun accessLayout(content: String): AccessLayout {
        val logic = LayoutLogicReader.read(content)
        val expressionNames = AccessLayoutComposer
            .expressionRoutineOf(logic)
            ?.let { routine -> vbaModule(routine.content, Language.VBA).declarations.flatMap { it.names } }
            .orEmpty()
            .filterNot { name -> isExpressionRoutine(name) || name.segments.first().startsWith(FIELD_OR_CONTROL_START) }
        val names = logic.dataSources.map { VbaName(listOf(it), VbaNameKind.RELATION) } +
            logic.subforms.map { VbaName(listOf(it), VbaNameKind.FORM) } +
            logic.subreports.map { VbaName(listOf(it), VbaNameKind.REPORT) } +
            expressionNames
        return AccessLayout(names, logic.queries.map { accessQuery(it) }, logic.bindsEventProcedure)
    }

    private fun isExpressionRoutine(name: VbaName): Boolean =
        name.segments.first().equals(AccessLayoutComposer.EXPRESSION_ROUTINE, ignoreCase = true)

    /** What a VBA or VB6 module declares and names, for the name lookup of `vba.md`. */
    fun vbaModule(content: String, language: Language): VbaModule {
        require(language in VBA_LANGUAGES) { "A VBA module is read as VBA or VB6, not as ${language.name}" }
        val grammar = NativeTreeSitter.grammar(LanguageRegistry.getGrammarLibrary(language))
        return FfmSyntaxTree.parse(content, grammar).use { it.readReleasingReachedNodes(VbaModuleReader::read) }
    }

    fun bundlerAliases(
        configuration: String,
        grammarLibrary: GrammarLibrary,
        extractAliases: (SyntaxNode) -> List<BundlerAlias>
    ): List<BundlerAlias> =
        FfmSyntaxTree.parse(configuration, NativeTreeSitter.grammar(grammarLibrary)).use { it.readReleasingReachedNodes(extractAliases) }
}
