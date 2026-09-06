package de.maibornwolff.treesitter.excavationsite.integration.dependencies

import de.maibornwolff.treesitter.excavationsite.shared.domain.DependencyResult
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import org.treesitter.TSLanguage

object DependenciesFacade {
    fun analyze(
        content: String,
        treeSitterLanguage: TSLanguage,
        mapping: LanguageDependencyMapping,
        preprocessor: ((String) -> String)? = null
    ): DependencyResult {
        val processedContent = preprocessor?.invoke(content) ?: content
        val collector = DependencyCollector(treeSitterLanguage, mapping)
        return collector.collectDependencies(processedContent)
    }
}
