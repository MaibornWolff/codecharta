package de.maibornwolff.treesitter.excavationsite.integration.dependencies

import de.maibornwolff.treesitter.excavationsite.shared.domain.DependencyResult
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeSitterParser
import org.treesitter.TSLanguage

/**
 * Orchestrates dependency extraction by parsing source code and
 * delegating to a [LanguageDependencyMapping] for language-specific extraction.
 */
class DependencyCollector(private val treeSitterLanguage: TSLanguage, private val mapping: LanguageDependencyMapping) {
    fun collectDependencies(content: String): DependencyResult {
        val rootNode = TreeSitterParser.parse(content, treeSitterLanguage)
        return DependencyResult(
            packagePath = mapping.extractPackagePath(rootNode, content),
            imports = mapping.extractImports(rootNode, content),
            declarations = mapping.extractDeclarations(rootNode, content)
        )
    }
}
