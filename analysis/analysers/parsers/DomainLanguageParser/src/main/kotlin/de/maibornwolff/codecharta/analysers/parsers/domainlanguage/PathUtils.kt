package de.maibornwolff.codecharta.analysers.parsers.domainlanguage

/**
 * Path helpers shared by the output aggregators. Paths are normalized to forward slashes so a project
 * analysed on Windows produces the same node paths as one analysed on Unix.
 */
object PathUtils {
    fun splitPath(path: String): List<String> = path.split('/', '\\').filter { it.isNotEmpty() }

    fun joinPath(vararg parts: String): String = parts.filter { it.isNotEmpty() }.joinToString("/")

    fun normalizePath(path: String): String = path.replace('\\', '/')
}
