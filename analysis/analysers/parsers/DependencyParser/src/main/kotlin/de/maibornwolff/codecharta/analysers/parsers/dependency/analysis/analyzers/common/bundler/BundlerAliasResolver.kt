package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.bundler

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.model.DirectImport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.toRelativePath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import java.io.File

/**
 * Resolves import paths using bundler alias mappings.
 * Handles prefix matching: "Shared" alias matches "Shared/Utils".
 */
object BundlerAliasResolver {
    fun resolve(import: DirectImport, config: BundlerConfigData, analysisRoot: File): Path? {
        val resolved = resolveAlias(import.directPath, config.aliases) ?: return null
        return toRelativePath(resolved, analysisRoot, stripExtension = true)
    }

    private fun resolveAlias(importPath: String, aliases: Map<String, String>): File? {
        for ((alias, target) in aliases) {
            val matched = tryMatchAlias(importPath, alias, target)
            if (matched != null) {
                return matched
            }
        }
        return null
    }

    private fun tryMatchAlias(importPath: String, alias: String, target: String): File? {
        // Exact match: "Shared" -> target
        if (importPath == alias) {
            return File(target)
        }

        // Prefix match: "Shared/Utils" with alias "Shared" -> target/Utils
        if (importPath.startsWith("$alias/")) {
            val suffix = importPath.substring(alias.length + 1)
            return File(target).resolve(suffix)
        }

        return null
    }
}
