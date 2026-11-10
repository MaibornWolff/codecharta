package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.model.ExternalImport
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration

/**
 * The npm packages a JavaScript or TypeScript file imports: a bare specifier that names no project file through a
 * relative path, an alias or a workspace package, cut to its package name (`@scope/name/deep` → `@scope/name`).
 * Node's own modules, `node:`-prefixed or not, and specifiers a bundler resolves (`~/`, `#`, `virtual:`) are none.
 */
internal object NpmImports {
    private const val ECOSYSTEM = "npm"
    private const val SCOPE_PREFIX = "@"
    private val NOT_A_PACKAGE_START = listOf(".", "/", "~", "#", "$")
    private val NODE_MODULES = setOf(
        "assert", "async_hooks", "buffer", "child_process", "cluster", "console", "constants", "crypto", "dgram",
        "diagnostics_channel", "dns", "domain", "events", "fs", "http", "http2", "https", "inspector", "module", "net", "os",
        "path", "perf_hooks", "process", "punycode", "querystring", "readline", "repl", "stream", "string_decoder", "sys",
        "timers", "tls", "trace_events", "tty", "url", "util", "v8", "vm", "wasi", "worker_threads", "zlib"
    )

    fun of(imports: List<ImportDeclaration>, fileInfo: FileInfo): Set<ExternalImport> =
        imports.mapNotNull { packageOf(it, fileInfo) }.toSet()

    private fun packageOf(import: ImportDeclaration, fileInfo: FileInfo): ExternalImport? {
        val specifier = ImportedModules.specifierOf(import)
        val first = specifier.firstOrNull() ?: return null
        if (NOT_A_PACKAGE_START.any { first.startsWith(it) } || ':' in first || first in NODE_MODULES) return null
        val isScoped = first.startsWith(SCOPE_PREFIX)
        if (isScoped && specifier.size < 2) return null
        if (ImportedModules.fileOf(import, fileInfo) != null) return null
        return ExternalImport(ECOSYSTEM, if (isScoped) "$first/${specifier[1]}" else first)
    }
}
