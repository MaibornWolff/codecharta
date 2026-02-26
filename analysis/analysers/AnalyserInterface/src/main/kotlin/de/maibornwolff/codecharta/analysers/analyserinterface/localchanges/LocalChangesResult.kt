package de.maibornwolff.codecharta.analysers.analyserinterface.localchanges

data class LocalChangesResult(
    val changedFiles: Set<String>,
    val deletedFiles: Set<String>
) {
    companion object {
        val EMPTY = LocalChangesResult(emptySet(), emptySet())
    }
}
