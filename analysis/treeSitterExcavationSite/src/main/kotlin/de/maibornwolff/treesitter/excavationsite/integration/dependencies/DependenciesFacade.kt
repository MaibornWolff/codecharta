package de.maibornwolff.treesitter.excavationsite.integration.dependencies

import de.maibornwolff.treesitter.excavationsite.shared.domain.GrammarLibrary
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.NativeTreeSitter

object DependenciesFacade {
    fun analyze(
        content: String,
        grammarLibrary: GrammarLibrary,
        mapping: LanguageDependencyMapping,
        preprocessor: ((String) -> String)? = null
    ): CollectedDependencies {
        val processedContent = preprocessor?.invoke(content) ?: content
        val collector = DependencyCollector(NativeTreeSitter.grammar(grammarLibrary), mapping)
        return collector.collectDependencies(processedContent)
    }
}
