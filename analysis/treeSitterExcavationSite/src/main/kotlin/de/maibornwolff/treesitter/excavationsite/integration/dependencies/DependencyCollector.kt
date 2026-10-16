package de.maibornwolff.treesitter.excavationsite.integration.dependencies

import de.maibornwolff.treesitter.excavationsite.shared.domain.DependencyResult
import de.maibornwolff.treesitter.excavationsite.shared.domain.EmbeddedSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.EmbeddedSourceMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.FfmGrammar
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.FfmSyntaxTree

internal class DependencyCollector(
    private val grammar: FfmGrammar,
    private val mapping: LanguageDependencyMapping,
    private val embeddedSources: EmbeddedSourceMapping?
) {
    fun collectDependencies(content: String): CollectedDependencies = FfmSyntaxTree.parse(content, grammar).use { tree ->
        CollectedDependencies(
            ofFile = DependencyResult(
                packagePath = tree.readReleasingReachedNodes(mapping.extractPackagePath),
                imports = tree.readReleasingReachedNodes(mapping.extractImports),
                declarations = tree.readReleasingReachedNodes(mapping.extractDeclarations)
            ),
            embeddedSources = embeddedSources
                ?.takeIf { content.contains(it.marker) }
                ?.let { tree.readReleasingReachedNodes(it.extract) }
                .orEmpty()
        )
    }
}

internal class CollectedDependencies(val ofFile: DependencyResult, val embeddedSources: List<EmbeddedSource>)
