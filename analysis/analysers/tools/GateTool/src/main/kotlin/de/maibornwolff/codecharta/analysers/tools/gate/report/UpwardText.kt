package de.maibornwolff.codecharta.analysers.tools.gate.report

import de.maibornwolff.codecharta.analysers.tools.gate.rules.UpwardViolation

object UpwardText {
    private const val TOP_FOLDER = "./"

    fun lines(upwardDependencies: List<UpwardViolation>): List<String> = upwardDependencies
        .groupBy { sharedFolder(listOf(it.from.file, it.to.file)) }
        .toSortedMap()
        .flatMap { (folder, dependencies) ->
            listOf("${TextLayout.INDENT}in ${folder.ifEmpty { TOP_FOLDER }}") +
                TextLayout.arrowLines(
                    dependencies.map { TextLayout.declarationText(it.from, folder) to TextLayout.declarationText(it.to, folder) }
                )
        }
}
