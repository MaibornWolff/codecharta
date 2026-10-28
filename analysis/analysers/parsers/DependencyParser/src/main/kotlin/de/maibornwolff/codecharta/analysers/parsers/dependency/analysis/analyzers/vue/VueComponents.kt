package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.withoutFileSuffix
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.splitNameToParts
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * The Vue components of a project by their names, for Vue tag rule 6 of `docs/name-resolution/typescript.md`: a
 * component is named after its file, `creature-badge.vue` as `CreatureBadge`, and has the path [VueAnalyzer] gives
 * it; the analysed files of a run, or every file below the root for a file analysed on its own, read once per run.
 */
internal class VueComponents private constructor(private val pathsByName: Map<String, List<Path>>) {
    /** The path of the one component named [name], none where the project has several or none. */
    fun onlyOneNamed(name: String): Path? = pathsByName[name]?.singleOrNull()

    companion object {
        private const val VUE_ENDING = "vue"
        private val componentsByRun = ConcurrentHashMap<Pair<String, Set<String>>, VueComponents>()

        fun of(analysisRoot: File, analysedFiles: Set<String>): VueComponents =
            componentsByRun.computeIfAbsent(analysisRoot.absolutePath to analysedFiles) { read(analysisRoot, analysedFiles) }

        private fun read(analysisRoot: File, analysedFiles: Set<String>): VueComponents {
            val pathsByName = ProjectFiles
                .pathsOf(analysisRoot, analysedFiles)
                .filter { it.endsWith(".$VUE_ENDING") }
                .map { Path(splitNameToParts(it)).withoutFileSuffix(VUE_ENDING) }
                .groupBy { VueNames.pascalCaseOf(it.parts.last()) }
            return VueComponents(pathsByName)
        }
    }
}
