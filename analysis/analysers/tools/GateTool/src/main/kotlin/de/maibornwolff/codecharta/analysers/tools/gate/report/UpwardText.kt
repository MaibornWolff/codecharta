package de.maibornwolff.codecharta.analysers.tools.gate.report

import de.maibornwolff.codecharta.analysers.tools.gate.rules.Violation

object UpwardText {
    private const val INDENT = "  "
    private const val TOP_FOLDER = "./"

    fun lines(upwardDependencies: List<Violation>): List<String> = upwardDependencies
        .groupBy { sharedFolder(listOf(it.path!!, it.target!!)) }
        .toSortedMap()
        .flatMap { (folder, dependencies) ->
            listOf("${INDENT}in ${folder.ifEmpty { TOP_FOLDER }}") + dependencyLines(folder, dependencies)
        }

    private fun dependencyLines(folder: String, dependencies: List<Violation>): List<String> {
        val width = dependencies.maxOf { it.path!!.length } - folder.length
        return dependencies.map { "$INDENT$INDENT${it.path!!.removePrefix(folder).padEnd(width)} → ${it.target!!.removePrefix(folder)}" }
    }
}
