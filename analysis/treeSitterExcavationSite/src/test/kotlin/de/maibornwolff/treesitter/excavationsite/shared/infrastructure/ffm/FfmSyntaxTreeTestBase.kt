package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import de.maibornwolff.treesitter.excavationsite.shared.domain.GrammarLibrary

abstract class FfmSyntaxTreeTestBase {
    internal val java = NativeTreeSitter.grammar(GrammarLibrary("java"))

    internal fun visitedTypes(code: String): List<String> = FfmSyntaxTree.parse(code, java).use { tree ->
        val types = mutableListOf<String>()
        tree.walk { _, nodeType -> types.add(nodeType) }
        types
    }
}
