package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python

import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * Which names `from module import *` binds, by "What an import binds" of `docs/name-resolution/python.md`: the names
 * the module's `__all__` lists, when it writes one as a list or tuple of strings, else every name not starting with `_`.
 */
internal class WildcardExports private constructor(private val analysisRoot: File) {
    private val listedNamesByModule = ConcurrentHashMap<List<String>, ListedNames>()

    /** Whether a wildcard import of the module at the logical path [modulePath] binds [name]. */
    fun exports(modulePath: List<String>, name: String): Boolean =
        listedNamesByModule.computeIfAbsent(modulePath) { ListedNames(readListedNames(it)) }.names?.contains(name) ?: isPublic(name)

    private fun readListedNames(modulePath: List<String>): Set<String>? {
        val file = analysisRoot.resolve(modulePath.joinToString(File.separator) + PYTHON_SUFFIX).takeIf { it.isFile } ?: return null
        val list = ALL_ASSIGNMENT.find(file.readText())?.groupValues?.get(1) ?: return null
        return QUOTED_NAME.findAll(list).map { it.groupValues[1] }.toSet()
    }

    private class ListedNames(val names: Set<String>?)

    companion object {
        private const val PYTHON_SUFFIX = ".py"
        private const val PRIVATE_PREFIX = "_"
        private val ALL_ASSIGNMENT = Regex("""^__all__\s*(?::[^=\n]*)?=\s*[\[(]([^\])]*)[\])]""", RegexOption.MULTILINE)
        private val QUOTED_NAME = Regex("""["']([A-Za-z_][A-Za-z0-9_]*)["']""")
        private val exportsByRoot = ConcurrentHashMap<String, WildcardExports>()

        /** The wildcard exports of the modules below [analysisRoot], each read once, as every Python file may ask for them. */
        fun of(analysisRoot: File): WildcardExports =
            exportsByRoot.computeIfAbsent(analysisRoot.absolutePath) { WildcardExports(analysisRoot) }

        /** Whether a wildcard import binds [name] when the module lists no names in `__all__`. */
        fun isPublic(name: String): Boolean = !name.startsWith(PRIVATE_PREFIX)
    }
}
