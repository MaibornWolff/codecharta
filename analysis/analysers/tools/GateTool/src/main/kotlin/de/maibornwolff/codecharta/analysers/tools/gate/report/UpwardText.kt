package de.maibornwolff.codecharta.analysers.tools.gate.report

import de.maibornwolff.codecharta.analysers.tools.gate.rules.Violation

object UpwardText {
    private const val INDENT = "  "
    private const val TOP_FOLDER = "./"

    fun lines(upwardDependencies: List<Violation>): List<String> = upwardDependencies
        .groupBy { sharedFolder(listOf(it.path!!, it.target!!)) }
        .toSortedMap()
        .flatMap { (folder, dependencies) ->
            listOf("${INDENT}in ${folder.ifEmpty { TOP_FOLDER }}") +
                arrowLines(dependencies.map { declarationText(it.declarations[0], folder) to declarationText(it.declarations[1], folder) })
        }
}
