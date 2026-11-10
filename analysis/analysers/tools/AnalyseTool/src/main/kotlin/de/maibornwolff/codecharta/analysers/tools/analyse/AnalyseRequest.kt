package de.maibornwolff.codecharta.analysers.tools.analyse

import de.maibornwolff.codecharta.analysers.importers.sbom.SbomLookups
import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.Bom
import java.io.File
import java.time.LocalDate

/** An SBOM to import into the map, read before the analysis starts so a broken one stops it right away. */
data class SbomSource(val bom: Bom, val lookups: SbomLookups = SbomLookups())

data class AnalyseRequest(
    val projectFolder: File,
    val outputFile: File,
    val excludePatterns: List<String> = emptyList(),
    val leftOut: Set<String> = emptySet(),
    val parallel: Boolean = false,
    val compress: Boolean = true,
    val analysedFolder: File = projectFolder,
    val commitHash: String? = null,
    val localChanges: Boolean = false,
    val authorOwnership: Boolean = false,
    val withAuthorNames: Boolean = false,
    val commitChangesSince: LocalDate? = null,
    val sbom: SbomSource? = null
)
