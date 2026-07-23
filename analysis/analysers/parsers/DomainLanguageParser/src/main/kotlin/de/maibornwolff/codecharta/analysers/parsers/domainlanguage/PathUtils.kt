package de.maibornwolff.codecharta.analysers.parsers.domainlanguage

object PathUtils {
    fun splitPath(path: String): List<String> = path.split('/', '\\').filter { it.isNotEmpty() }

    fun joinPath(vararg parts: String): String = parts.filter { it.isNotEmpty() }.joinToString("/")

    fun normalizePath(path: String): String = path.replace('\\', '/')
}
