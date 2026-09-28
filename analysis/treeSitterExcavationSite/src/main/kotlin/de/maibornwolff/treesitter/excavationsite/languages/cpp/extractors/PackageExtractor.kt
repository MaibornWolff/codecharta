package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import org.treesitter.TSNode

internal object PackageExtractor {
    fun extract(rootNode: TSNode, sourceCode: String): List<String> = CppNamespaceWalker.firstFileNamespace(rootNode, sourceCode)
}
