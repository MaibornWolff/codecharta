package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.stripSourceFileExtension
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo

/**
 * Resolves a TSE import path (List<String>) to a flat list of path segments.
 *
 * - Relative paths (starting with "." or "..") are resolved against the containing file's location.
 * - Bare specifiers (e.g. "@shared/utils") are resolved through config-based alias resolution
 *   (tsconfig/jsconfig `paths` -> bundler aliases -> federation remotes) via [AliasPathResolver],
 *   falling back to the unresolved literal path so real npm packages stay external.
 */
fun resolveImportPath(tsePath: List<String>, fileInfo: FileInfo): List<String> {
    val stripped = tsePath.map { it.stripSourceFileExtension() }.filter { it.isNotEmpty() }
    if (stripped.isEmpty()) return stripped
    if (stripped.first() != "." && stripped.first() != "..") {
        // Bare specifier (e.g. "@shared/utils"): try config-based alias resolution
        // (tsconfig paths -> bundler aliases -> federation remotes). Falls back to the
        // unresolved literal path, so real npm packages stay external as before.
        return AliasPathResolver.resolve(stripped.joinToString("/"), fileInfo)?.parts ?: stripped
    }
    var dirParts = fileInfo.physicalPathAsPath().parts.dropLast(1)
    var remaining = stripped
    while (remaining.isNotEmpty() && (remaining.first() == "." || remaining.first() == "..")) {
        if (remaining.first() == "..") dirParts = dirParts.dropLast(1)
        remaining = remaining.drop(1)
    }
    return dirParts + remaining
}
