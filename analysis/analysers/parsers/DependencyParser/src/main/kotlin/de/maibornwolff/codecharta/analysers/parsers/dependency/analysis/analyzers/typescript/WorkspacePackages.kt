package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * The packages of a workspace, by "Module specifiers" 2.3 of `docs/name-resolution/typescript.md`: each folder below the
 * analysis root whose `package.json` has a name, so a bare specifier that names the package, or a path below it, means
 * that folder, as the compiler finds it through `node_modules` after an install. Of two packages of one name the
 * shallower one counts, then the first in path order.
 */
internal class WorkspacePackages private constructor(private val foldersByName: Map<String, File>) {
    /** The folder or path below it a bare specifier names, the package with the longest matching name first. */
    fun pathOf(specifier: String): File? = foldersByName.entries
        .filter { (name, _) -> specifier == name || specifier.startsWith("$name$SEPARATOR") }
        .maxByOrNull { (name, _) -> name.length }
        ?.let { (name, folder) -> if (specifier == name) folder else folder.resolve(specifier.removePrefix("$name$SEPARATOR")) }

    companion object {
        private const val SEPARATOR = "/"
        private const val PACKAGE_JSON = "package.json"
        private const val HIDDEN_PREFIX = "."
        private const val NODE_MODULES = "node_modules"
        private val packagesByRoot = ConcurrentHashMap<String, WorkspacePackages>()

        /** The packages below [analysisRoot], read once, as every TypeScript and JavaScript file may ask for them. */
        fun of(analysisRoot: File): WorkspacePackages = packagesByRoot.computeIfAbsent(analysisRoot.absolutePath) { read(analysisRoot) }

        private fun read(analysisRoot: File): WorkspacePackages {
            val packageFiles = analysisRoot
                .walkTopDown()
                .onEnter { folder -> folder == analysisRoot || !(folder.name.startsWith(HIDDEN_PREFIX) || folder.name == NODE_MODULES) }
                .filter { it.name == PACKAGE_JSON && it.isFile }
                .sortedWith(compareBy<File>({ it.invariantSeparatorsPath.count { char -> char == '/' } }, { it.invariantSeparatorsPath }))
            val foldersByName = LinkedHashMap<String, File>()
            packageFiles.forEach { file -> PackageJson.read(file)?.name?.let { name -> foldersByName.putIfAbsent(name, file.parentFile) } }
            return WorkspacePackages(foldersByName)
        }
    }
}
