package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.splitNameToParts
import de.maibornwolff.treesitter.excavationsite.api.RustModule
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * The crates and the module tree of the Rust files of a run, read once: every Rust file of the run asks for them. A
 * file is its path below the analysis root in segments.
 */
internal class RustProject private constructor(
    rustFiles: Set<List<String>>,
    val crates: RustCrates,
    private val sourceOf: (List<String>) -> String
) {
    private val facts = ConcurrentHashMap<List<String>, RustModule>()
    val tree = RustModuleTree(crates, rustFiles, ::factsOf)

    /** What a file declares and writes, read once. */
    fun factsOf(file: List<String>): RustModule = facts.computeIfAbsent(file) { TreeSitterDependencies.rustModule(sourceOf(it)) }

    companion object {
        private val projectsByRun = ConcurrentHashMap<Pair<String, Set<String>>, RustProject>()
        private const val RUST_SUFFIX = ".rs"
        private const val CURRENT_FOLDER = "."
        private const val HIDDEN_PREFIX = "."
        private val SKIPPED_FOLDERS = setOf("target", "node_modules")

        /** The project of a run over [analysisRoot]; [analysedFiles] empty means every file below the root. */
        fun of(analysisRoot: File, analysedFiles: Set<String>): RustProject = projectsByRun.computeIfAbsent(
            analysisRoot.absolutePath to analysedFiles
        ) {
            val rustFiles = analysedFiles
                .ifEmpty {
                    filesBelow(
                        analysisRoot
                    )
                }.filter { it.endsWith(RUST_SUFFIX) }
                .mapTo(HashSet()) { segmentsOf(it) }
            RustProject(
                rustFiles,
                RustCrates(analysisRoot, rustFiles)
            ) { file -> analysisRoot.resolve(file.joinToString(File.separator)).readText() }
        }

        /** A file analysed without a root: a module tree of its own, without `Cargo.toml`. */
        fun ofSingleFile(file: List<String>, content: String): RustProject {
            val rustFiles = setOf(file).filterTo(HashSet()) { it.isNotEmpty() }
            return RustProject(rustFiles, RustCrates(null, rustFiles)) { content }
        }

        fun segmentsOf(physicalPath: String): List<String> = splitNameToParts(physicalPath).filter { it != CURRENT_FOLDER }

        private fun filesBelow(analysisRoot: File): Set<String> = analysisRoot
            .walkTopDown()
            .onEnter { folder -> folder == analysisRoot || !(folder.name.startsWith(HIDDEN_PREFIX) || folder.name in SKIPPED_FOLDERS) }
            .filter { it.isFile }
            .mapTo(HashSet()) { it.relativeTo(analysisRoot).path }
    }
}
