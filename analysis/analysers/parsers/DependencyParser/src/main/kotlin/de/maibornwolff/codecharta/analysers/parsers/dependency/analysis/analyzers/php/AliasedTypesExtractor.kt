package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.queries.PhpNamespaceQueries
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import org.treesitter.TSNode

class AliasedTypesExtractor(private val code: String, private val root: TSNode) {
    val namespaceQueries = PhpNamespaceQueries()

    fun extract(): Map<Type, Path> {
        val asString: (TSNode) -> String = { nodeAsString(it, code) }
        val aliasedTypes = namespaceQueries.getAliasUsages(root)

        if (aliasedTypes.isEmpty()) {
            return emptyMap()
        }

        return aliasedTypes
            .chunked(2)
            .associate { Type.simple(asString(it[1])) to Path(asString(it[0]).split("\\")) }
    }
}
