package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang

import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * The folder below the analysis root a Go import path means, by "Import paths" of `docs/name-resolution/go.md`: the
 * modules of the `go.mod` files in the analysed folder, then `vendor/` of the importing file's module, then, for a file
 * under no `go.mod`, the folder the import path ends with; null for a library package.
 */
internal class GoModules private constructor(private val analysisRoot: File, private val folders: List<List<String>>) {
    private val modules: List<GoModule> = folders.mapNotNull { folder -> moduleIn(folder) }

    fun folderOf(importPath: List<String>, importingFolder: List<String>): List<String>? {
        val ownModule = moduleOf(importingFolder)
        return inModule(importPath)
            ?: ownModule?.let { vendored(importPath, it) }
            ?: if (ownModule == null) endingWith(importPath) else null
    }

    /** The name in the package clause of the folder's files, test files left out. */
    fun packageNameOf(folder: List<String>): String? = packageNameByFolder
        .computeIfAbsent(folder) { packageClauseIn(it) ?: NO_PACKAGE }
        .takeUnless { it == NO_PACKAGE }

    private val packageNameByFolder = ConcurrentHashMap<List<String>, String>()

    private fun packageClauseIn(folder: List<String>): String? = fileOf(folder)
        .listFiles { file -> file.isFile && file.name.endsWith(GO_SUFFIX) && !file.name.endsWith(TEST_SUFFIX) }
        .orEmpty()
        .sortedBy { it.name }
        .firstNotNullOfOrNull { file -> PACKAGE_CLAUSE.find(file.readText())?.groupValues?.get(1) }

    private fun inModule(importPath: List<String>): List<String>? = modules
        .filter { module -> importPath.startsWith(module.path) }
        .maxByOrNull { module -> module.path.size }
        ?.let { module -> module.folder + importPath.drop(module.path.size) }
        ?.takeIf { isFolder(it) }

    private fun vendored(importPath: List<String>, module: GoModule): List<String>? =
        (module.folder + VENDOR_FOLDER + importPath).takeIf { isFolder(it) }

    // The longest ending wins, the first folder in path order of equally long ones
    private fun endingWith(importPath: List<String>): List<String>? = (importPath.size downTo MIN_SEGMENTS_OF_ENDING)
        .firstNotNullOfOrNull { length -> folders.firstOrNull { it.takeLast(length) == importPath.takeLast(length) } }

    private fun moduleOf(folder: List<String>): GoModule? = modules
        .filter { module -> folder.startsWith(module.folder) }
        .maxByOrNull { module -> module.folder.size }

    private fun moduleIn(folder: List<String>): GoModule? {
        val moduleFile = fileOf(folder).resolve(MODULE_FILE).takeIf { it.isFile } ?: return null
        val modulePath = MODULE_LINE.find(moduleFile.readText())?.groupValues?.get(1) ?: return null
        return GoModule(modulePath.split(SEPARATOR), folder)
    }

    private fun isFolder(folder: List<String>): Boolean = fileOf(folder).isDirectory

    private fun fileOf(folder: List<String>): File = analysisRoot.resolve(folder.joinToString(File.separator))

    private fun List<String>.startsWith(prefix: List<String>): Boolean = take(prefix.size) == prefix

    private data class GoModule(val path: List<String>, val folder: List<String>)

    companion object {
        private const val MODULE_FILE = "go.mod"
        private const val VENDOR_FOLDER = "vendor"
        private const val MIN_SEGMENTS_OF_ENDING = 2
        private const val SEPARATOR = "/"
        private const val HIDDEN_PREFIX = "."
        private const val NODE_MODULES = "node_modules"
        private const val GO_SUFFIX = ".go"
        private const val TEST_SUFFIX = "_test.go"
        private const val NO_PACKAGE = ""
        private val PACKAGE_CLAUSE = Regex("""^\s*package\s+(\w+)""", RegexOption.MULTILINE)
        private val MODULE_LINE = Regex("""^\s*module\s+"?([^"\s]+)"?""", RegexOption.MULTILINE)
        private val modulesByRoot = ConcurrentHashMap<String, GoModules>()

        /** The modules of [analysisRoot], read once per root, as every Go file of an analysis asks for them. */
        fun of(analysisRoot: File): GoModules =
            modulesByRoot.computeIfAbsent(analysisRoot.absolutePath) { GoModules(analysisRoot, foldersBelow(analysisRoot)) }

        private fun foldersBelow(analysisRoot: File): List<List<String>> = analysisRoot
            .walkTopDown()
            .onEnter { folder -> folder == analysisRoot || !(folder.name.startsWith(HIDDEN_PREFIX) || folder.name == NODE_MODULES) }
            .filter { it.isDirectory }
            .map { folder -> folder.relativeTo(analysisRoot).invariantSeparatorsPath.split(SEPARATOR).filter { it.isNotEmpty() } }
            .sortedBy { it.joinToString(SEPARATOR) }
            .toList()
    }
}
