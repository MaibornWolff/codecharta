package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations.CppNamespaceWalker
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

internal object PackageExtractor {
    fun extract(rootNode: SyntaxNode): List<String> = CppNamespaceWalker.firstFileNamespace(rootNode)
}
