package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python

import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * The modules a Python module path means, by "Import paths" of `docs/name-resolution/python.md`, each as its logical
 * path: the file path below the analysis root without `.py`, ending in `__init__` for a package, the folder for a
 * namespace package.
 */
internal class PythonModules private constructor(private val folders: Set<List<String>>, private val moduleFiles: Set<List<String>>) {
    private val packages: Set<List<String>> = folders.filterTo(HashSet()) { it + PACKAGE_FILE in moduleFiles }
    private val packageRoots: List<List<String>> = packages.filter { it.dropLast(1) !in packages }.map { it.dropLast(1) }

    /** Below every import root that holds [modulePath], the nearest to [importingFolder] first, else the modules it ends with. */
    fun modulesOf(modulePath: List<String>, importingFolder: List<String>): List<List<String>> {
        val roots = (listOf(ANALYSIS_ROOT) + packageRoots + listOf(importingFolder)).distinct()
        val belowRoots = nearestFirst(roots, importingFolder).mapNotNull { root -> moduleAt(root + modulePath) }.distinct()
        return belowRoots.ifEmpty { endingWith(modulePath, importingFolder) }
    }

    /** The module a path below the analysis root holds: a package before a module file before a namespace package. */
    fun moduleAt(path: List<String>): List<String>? = when {
        path in packages -> path + PACKAGE_FILE
        path in moduleFiles -> path
        path in folders -> path
        else -> null
    }

    // The longest ending wins, then the nearest to the importing folder
    private fun endingWith(modulePath: List<String>, importingFolder: List<String>): List<List<String>> =
        (modulePath.size downTo MIN_SEGMENTS_OF_ENDING)
            .map { length -> (packages + moduleFiles).filter { it.size >= length && it.takeLast(length) == modulePath.takeLast(length) } }
            .firstOrNull { it.isNotEmpty() }
            ?.let { modules -> nearestFirst(modules, importingFolder).mapNotNull { moduleAt(it) }.distinct() }
            .orEmpty()

    private fun nearestFirst(paths: List<List<String>>, importingFolder: List<String>): List<List<String>> =
        paths.sortedWith(compareByDescending<List<String>> { sharedFolderCount(it, importingFolder) }.thenBy { it.joinToString(SEPARATOR) })

    private fun sharedFolderCount(path: List<String>, folder: List<String>): Int =
        path.zip(folder).takeWhile { (first, second) -> first == second }.size

    companion object {
        const val PACKAGE_FILE = "__init__"
        private val ANALYSIS_ROOT = emptyList<String>()
        private const val MIN_SEGMENTS_OF_ENDING = 2
        private const val SEPARATOR = "/"
        private const val HIDDEN_PREFIX = "."
        private const val PYTHON_SUFFIX = ".py"
        private val SKIPPED_FOLDERS = setOf("node_modules", "__pycache__")
        private val modulesByRoot = ConcurrentHashMap<String, PythonModules>()

        /** The modules of [analysisRoot], read once per root, as every Python file of an analysis asks for them. */
        fun of(analysisRoot: File): PythonModules = modulesByRoot.computeIfAbsent(analysisRoot.absolutePath) { read(analysisRoot) }

        private fun read(analysisRoot: File): PythonModules {
            val entries = analysisRoot
                .walkTopDown()
                .onEnter { folder -> folder == analysisRoot || !(folder.name.startsWith(HIDDEN_PREFIX) || folder.name in SKIPPED_FOLDERS) }
                .filter { it.isDirectory || it.name.endsWith(PYTHON_SUFFIX) }
                .toList()
            val (folders, files) = entries.partition { it.isDirectory }
            return PythonModules(
                folders.mapTo(HashSet()) { segmentsBelow(analysisRoot, it) },
                files.mapTo(HashSet()) {
                    segmentsBelow(analysisRoot, it).let { path ->
                        path.dropLast(1) +
                            path.last().removeSuffix(PYTHON_SUFFIX)
                    }
                }
            )
        }

        private fun segmentsBelow(analysisRoot: File, file: File): List<String> =
            file.relativeTo(analysisRoot).invariantSeparatorsPath.split(SEPARATOR).filter { it.isNotEmpty() }
    }
}
