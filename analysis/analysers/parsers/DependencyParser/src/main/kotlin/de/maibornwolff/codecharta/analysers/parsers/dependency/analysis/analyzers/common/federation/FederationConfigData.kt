package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.federation

import java.io.File

/**
 * Parsed Module Federation configuration from package.json.
 */
data class FederationConfigData(
    val name: String? = null,
    val remotes: Map<String, String> = emptyMap(),
    val exposes: Map<String, String> = emptyMap()
) {
    companion object {
        val EMPTY = FederationConfigData()
    }

    fun hasRemotes(): Boolean = remotes.isNotEmpty()

    fun hasExposes(): Boolean = exposes.isNotEmpty()
}

/**
 * Result of finding and parsing a federation config.
 */
data class FederationConfigResult(val data: FederationConfigData, val packageJsonFile: File, val moduleDir: File)
