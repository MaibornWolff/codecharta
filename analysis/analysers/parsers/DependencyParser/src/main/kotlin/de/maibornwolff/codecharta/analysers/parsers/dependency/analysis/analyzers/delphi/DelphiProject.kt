package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.delphi

import de.maibornwolff.treesitter.excavationsite.api.DelphiSection
import de.maibornwolff.treesitter.excavationsite.api.DelphiUnit
import de.maibornwolff.treesitter.excavationsite.api.DelphiUnitKind
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * The Delphi units of a run, read once: every Delphi file of the run looks names up in the units it uses. A unit that
 * several files declare (copies) offers what any of them declares; which file a use means is the copy rule's choice.
 */
internal class DelphiProject private constructor(private val files: Set<String>, private val sourceOf: (String) -> String) {
    private val units = ConcurrentHashMap<String, DelphiUnit>()
    private val unitsByName by lazy { unitsByName() }
    private val exportedScopes by lazy { exportedScopesByName() }

    /** What a file declares and writes, read once. */
    fun unitOf(file: String): DelphiUnit = units.computeIfAbsent(file) { TreeSitterDependencies.delphiUnit(sourceOf(it)) }

    /** What the unit of [name], written in any case, offers to the units that use it: its interface section. */
    fun exportedScopeOf(name: List<String>): UnitScope? = exportedScopes[keyOf(name)]

    /** The unit of [name], written in any case; the first copy of a unit that several files declare. */
    fun unitNamed(name: List<String>): DelphiUnit? = unitsByName[keyOf(name)]?.first()

    private fun unitsByName(): Map<String, List<DelphiUnit>> = files
        .map { unitOf(it) }
        .filter { it.kind == DelphiUnitKind.UNIT && it.name.isNotEmpty() }
        .groupBy { keyOf(it.name) }

    private fun exportedScopesByName(): Map<String, UnitScope> = unitsByName.mapValues { (_, copies) ->
        UnitScope(copies.first().name, copies.flatMap { copy -> copy.declarations.filter { it.section == DelphiSection.INTERFACE } })
    }

    companion object {
        private val projectsByRun = ConcurrentHashMap<Pair<String, Set<String>>, DelphiProject>()
        private val DELPHI_SUFFIXES = listOf(".pas", ".dpr")
        private const val HIDDEN_PREFIX = "."

        fun keyOf(name: List<String>): String = name.joinToString(".") { it.lowercase() }

        /** The project of a run over [analysisRoot]; [analysedFiles] empty means every Delphi file below the root. */
        fun of(analysisRoot: File, analysedFiles: Set<String>): DelphiProject = projectsByRun.computeIfAbsent(
            analysisRoot.absolutePath to analysedFiles
        ) {
            val files = analysedFiles.ifEmpty { filesBelow(analysisRoot) }.filterTo(HashSet()) { isDelphi(it) }
            DelphiProject(files) { file -> analysisRoot.resolve(file).readText() }
        }

        /** A file analysed without a root: a project of its own. */
        fun ofSingleFile(file: String, content: String): DelphiProject = DelphiProject(setOf(file)) { content }

        private fun isDelphi(file: String): Boolean = DELPHI_SUFFIXES.any { file.endsWith(it, ignoreCase = true) }

        private fun filesBelow(analysisRoot: File): Set<String> = analysisRoot
            .walkTopDown()
            .onEnter { folder -> folder == analysisRoot || !folder.name.startsWith(HIDDEN_PREFIX) }
            .filter { it.isFile }
            .mapTo(HashSet()) { it.relativeTo(analysisRoot).path }
    }
}
