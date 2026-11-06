package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vba

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.ProjectListing
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.readInParallel
import de.maibornwolff.codecharta.util.AccessQueryFiles
import de.maibornwolff.codecharta.util.SourceText
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.api.VbaNameKind
import java.io.File
import java.util.concurrent.ConcurrentHashMap

/** A project name a module declares: the module that declares it and the logical path the name means. */
internal data class VbaOffer(val module: VbaModuleFile, val path: List<String>)

/**
 * The VBA and VB6 modules of a run, read once: every module looks names up in the modules and public names of all of
 * them. A module name several files declare (two exported applications) offers what each of its copies declares.
 */
internal class VbaProject private constructor(
    private val files: Set<String>,
    private val queryFiles: Set<String>,
    layoutFiles: Set<String>,
    private val sourceOf: (String) -> String
) {
    private val modules = ConcurrentHashMap<String, VbaModuleFile>()
    private val modulesByName by lazy { allModules().groupBy { it.name.lowercase() } }
    private val offersByName by lazy { offersByName() }
    private val queryNames by lazy { queryFiles.map { AccessQueryFiles.queryNameOf(it) }.toSet() }
    private val layoutsByObject = layoutFiles
        .sorted()
        .groupBy { file -> VbaLayoutFiles.objectNameOf(file).lowercase() to VbaLayoutFiles.kindOf(file) }

    fun moduleOf(file: String): VbaModuleFile = modules.computeIfAbsent(file) {
        VbaModuleFile(it, TreeSitterDependencies.vbaModule(sourceOf(it), grammarOf(it)))
    }

    /** The copies of the module [name], written in any case. */
    fun modulesNamed(name: String): List<VbaModuleFile> = modulesByName[name.lowercase()].orEmpty()

    /** The logical path of the Access query [name], written in any case, or null if the run has no such query. */
    fun queryNamed(name: String): List<String>? = name.lowercase().takeIf { it in queryNames }?.let { listOf(it) }

    /**
     * The leaf of the layout of the form or report [name] of [kind], written in any case, or null if the run has none;
     * of the layouts of two exported applications the first by path.
     */
    fun layoutNamed(name: String, kind: VbaNameKind): List<String>? =
        layoutsByObject[name.lowercase() to kind]?.first()?.let { VbaLayoutFiles.leafOf(it) }

    /** The code module of the form or report a layout [file] holds, null for one without code. */
    fun codeModuleOfLayout(file: String): VbaModuleFile? {
        val kind = VbaLayoutFiles.kindOf(file) ?: return null
        return modulesNamed(VbaLayoutFiles.moduleNameOf(VbaLayoutFiles.objectNameOf(file), kind)).firstOrNull { it.isClass }
    }

    /** What the modules offer under [name] to every other module, written in any case. */
    fun offersOf(name: String): List<VbaOffer> = offersByName[name.lowercase()].orEmpty()

    // The index reads every file one after the other, while the other files of the run wait for it
    private fun allModules(): List<VbaModuleFile> {
        readInParallel(files) { moduleOf(it) }
        return files.sorted().map { moduleOf(it) }
    }

    private fun offersByName(): Map<String, List<VbaOffer>> = modulesByName.values
        .flatten()
        .flatMap { module -> offersOf(module) }
        .groupBy({ it.first }, { it.second })

    private fun offersOf(module: VbaModuleFile): List<Pair<String, VbaOffer>> =
        module.publicNames().map { (name, declaration) -> name.lowercase() to VbaOffer(module, module.pathOf(declaration)) }

    companion object {
        private val projectsByRun = ConcurrentHashMap<Pair<String, Set<String>>, VbaProject>()
        private val VBA_SUFFIXES = listOf(".bas", ".cls", ".frm")
        private const val VB6_FORM_SUFFIX = ".frm"
        private const val HIDDEN_PREFIX = "."

        /** The project of a run over [analysisRoot]; [analysedFiles] empty means every VBA file below the root. */
        fun of(analysisRoot: File, analysedFiles: Set<String>): VbaProject = projectsByRun.computeIfAbsent(
            analysisRoot.absolutePath to analysedFiles
        ) {
            val runFiles = analysedFiles.ifEmpty { filesBelow(analysisRoot) }
            val files = runFiles.filterTo(HashSet()) { isVba(it) }
            val queryFiles = runFiles.filterTo(HashSet()) { AccessQueryFiles.isQueryFile(it) }
            val layoutFiles = runFiles.filterTo(HashSet()) { VbaLayoutFiles.isLayout(it) }
            VbaProject(files, queryFiles, layoutFiles) { file -> SourceText.read(analysisRoot.resolve(file)) }
        }

        /** A file analysed without a root: a project of its own. */
        fun ofSingleFile(file: String, content: String): VbaProject {
            val moduleFiles = setOf(file).filterTo(HashSet()) { isVba(it) }
            val layoutFiles = setOf(file).filterTo(HashSet()) { VbaLayoutFiles.isLayout(it) }
            return VbaProject(moduleFiles, emptySet(), layoutFiles) { content }
        }

        private fun grammarOf(file: String): Language =
            if (file.endsWith(VB6_FORM_SUFFIX, ignoreCase = true)) Language.VB6 else Language.VBA

        private fun isVba(file: String): Boolean = VBA_SUFFIXES.any { file.endsWith(it, ignoreCase = true) }

        private fun filesBelow(analysisRoot: File): Set<String> =
            ProjectListing.of(analysisRoot).filePathsOutside { name -> name.startsWith(HIDDEN_PREFIX) }
    }
}
