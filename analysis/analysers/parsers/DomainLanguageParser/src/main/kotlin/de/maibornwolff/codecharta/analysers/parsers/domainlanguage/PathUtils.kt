package de.maibornwolff.codecharta.analysers.parsers.domainlanguage

object PathUtils {
    fun normalizePath(path: String): String = path.replace('\\', '/')
}
