package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.tools.gate.config.AcceptedDependency
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity

class Acceptance private constructor(
    private val entries: List<AcceptedDependency>,
    private val setting: String,
    private val identityOf: (List<String>) -> Any
) {
    private val acceptedIdentities = entries.mapTo(HashSet()) { identityOf(it.files) }

    fun accepts(files: List<String>): Boolean = identityOf(files) in acceptedIdentities

    fun staleAmong(foundFiles: List<List<String>>): List<StaleAcceptance> {
        val foundIdentities = foundFiles.mapTo(HashSet(), identityOf)
        return entries
            .withIndex()
            .filterNot { (_, entry) -> identityOf(entry.files) in foundIdentities }
            .map { (index, entry) -> StaleAcceptance(Severity.WARNING, STALE_INSTRUCTION, "$setting[$index]", entry.files) }
    }

    companion object {
        private const val STALE_INSTRUCTION =
            "The analysis no longer finds these accepted dependencies: remove their entries from the config."

        fun ofCycles(entries: List<AcceptedDependency>, setting: String) = Acceptance(entries, setting) { files -> files.toSet() }

        fun ofUpwardDependencies(entries: List<AcceptedDependency>, setting: String) = Acceptance(entries, setting) { files -> files }
    }
}
