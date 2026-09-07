package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.tsconfig

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.model.DirectImport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.toRelativePath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import java.io.File

object PathAliasResolver {
    private val SOURCE_EXTENSIONS = listOf(".ts", ".tsx", ".js", ".jsx", ".vue", ".json")
    private const val WILDCARD_SUFFIX = "/*"

    // Main entry point: resolves "@app/models" with paths config to Path(["src", "app", "models"])
    fun resolve(import: DirectImport, config: TsConfigData, tsconfigDir: File, analysisRoot: File): Path? {
        val compilerOptions = config.compilerOptions ?: return null
        val result = resolveAgainstConfig(import.directPath, compilerOptions) ?: return null
        val absolutePath = computeAbsolutePath(result.resolvedPath, compilerOptions.baseUrl, tsconfigDir)

        // For baseUrl fallback (no explicit path pattern match), verify file exists
        // This prevents baseUrl from claiming federation imports or other non-file imports
        if (result.isBaseUrlFallback && !fileExistsWithAnyExtension(absolutePath)) {
            return null
        }

        return toRelativePath(absolutePath, analysisRoot, stripExtension = true)
    }

    private data class ResolveResult(val resolvedPath: String, val isBaseUrlFallback: Boolean)

    // Check if file exists with any of the common source extensions
    private fun fileExistsWithAnyExtension(basePath: File): Boolean {
        if (basePath.exists()) return true
        return SOURCE_EXTENSIONS.any { ext ->
            File(basePath.path + ext).exists()
        }
    }

    // Resolves import path using path mappings or baseUrl fallback
    // Example: "@app/models" with "@app/*" -> "src/app/*" returns "src/app/models"
    private fun resolveAgainstConfig(importPath: String, options: CompilerOptions): ResolveResult? {
        val matchedPath = findMatchingPath(importPath, options.paths)
        if (matchedPath != null) {
            return ResolveResult(matchedPath, isBaseUrlFallback = false)
        }
        if (options.baseUrl != null) {
            return ResolveResult(importPath, isBaseUrlFallback = true)
        }
        return null
    }

    // Computes absolute path by combining baseUrl and resolved path
    // Example: "src/app/models" with baseUrl "." in "/project" -> "/project/src/app/models"
    private fun computeAbsolutePath(resolvedPath: String, baseUrl: String?, tsconfigDir: File): File {
        val fullPath = if (baseUrl != null) {
            val normalizedBaseUrl = baseUrl.removePrefix("./").removeSuffix("/")
            "$normalizedBaseUrl/$resolvedPath"
        } else {
            resolvedPath
        }
        return tsconfigDir.resolve(fullPath).canonicalFile
    }

    // An exact pattern wins, then the wildcard pattern with the longest prefix, as TypeScript matches them.
    private fun findMatchingPath(importPath: String, paths: Map<String, List<String>>?): String? {
        if (paths == null) return null
        paths[importPath]?.let { return it.firstOrNull() }
        return paths.entries
            .filter { (pattern, _) ->
                pattern.endsWith(WILDCARD_SUFFIX) && matchesPrefix(importPath, pattern.removeSuffix(WILDCARD_SUFFIX))
            }.sortedByDescending { (pattern, _) -> pattern.length }
            .firstNotNullOfOrNull { (pattern, mappings) -> tryWildcardMatch(importPath, pattern, mappings) }
    }

    // Handles wildcard pattern matching: "@app/models" with "@app/*" -> "src/app/*" = "src/app/models"
    private fun tryWildcardMatch(importPath: String, pattern: String, mappings: List<String>): String? {
        val prefix = pattern.removeSuffix(WILDCARD_SUFFIX)

        if (!matchesPrefix(importPath, prefix)) {
            return null
        }

        val suffix = extractSuffix(importPath, prefix)
        val mapping = mappings.firstOrNull() ?: return null

        if (mapping.endsWith(WILDCARD_SUFFIX)) {
            return substituteWildcard(mapping, suffix)
        }

        return null
    }

    // Validates prefix with boundary: "core/models" matches "core", but "coreutils" does not
    private fun matchesPrefix(importPath: String, prefix: String): Boolean {
        if (!importPath.startsWith(prefix)) {
            return false
        }
        // Match if exact or followed by slash (word boundary)
        return importPath.length == prefix.length || importPath[prefix.length] == '/'
    }

    // Extracts remainder after prefix: "core/models/user" with "core" -> "models/user"
    private fun extractSuffix(importPath: String, prefix: String): String = if (importPath.length > prefix.length) {
        importPath.substring(prefix.length + 1)
    } else {
        ""
    }

    // Substitutes wildcard: "src/app/*" with "models/user" -> "src/app/models/user"
    private fun substituteWildcard(mapping: String, suffix: String): String {
        val baseMapping = mapping.removeSuffix(WILDCARD_SUFFIX)
        return if (suffix.isNotEmpty()) {
            "$baseMapping/$suffix"
        } else {
            baseMapping
        }
    }
}
