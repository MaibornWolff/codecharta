package de.maibornwolff.treesitter.excavationsite.integration.dependencies

import de.maibornwolff.treesitter.excavationsite.shared.domain.DependencyResult
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.FfmGrammar
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.FfmSyntaxTree

internal class DependencyCollector(private val grammar: FfmGrammar, private val mapping: LanguageDependencyMapping) {
    fun collectDependencies(content: String): DependencyResult = FfmSyntaxTree.parse(content, grammar).use { tree ->
        DependencyResult(
            packagePath = tree.readReleasingReachedNodes(mapping.extractPackagePath),
            imports = tree.readReleasingReachedNodes(mapping.extractImports),
            declarations = tree.readReleasingReachedNodes(mapping.extractDeclarations)
        )
    }
}
