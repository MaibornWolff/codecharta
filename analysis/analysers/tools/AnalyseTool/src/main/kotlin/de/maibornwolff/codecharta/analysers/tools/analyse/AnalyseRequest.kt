package de.maibornwolff.codecharta.analysers.tools.analyse

import java.io.File

data class AnalyseRequest(
    val projectFolder: File,
    val outputFile: File,
    val excludePatterns: List<String> = emptyList(),
    val leftOut: Set<String> = emptySet(),
    val parallel: Boolean = false,
    val compress: Boolean = true,
    val analysedFolder: File = projectFolder,
    val commitHash: String? = null,
    val localChanges: Boolean = false
)
