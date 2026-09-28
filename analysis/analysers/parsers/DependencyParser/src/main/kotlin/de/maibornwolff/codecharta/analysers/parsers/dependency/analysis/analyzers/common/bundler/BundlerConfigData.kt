package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.bundler

import java.io.File

/**
 * Parsed bundler configuration containing alias mappings.
 * Supports webpack.config.js, vite.config.js/ts, vue.config.js.
 */
data class BundlerConfigData(val aliases: Map<String, String> = emptyMap()) {
    companion object {
        val EMPTY = BundlerConfigData()
    }
}

/**
 * Result of finding and parsing a bundler config file.
 */
data class BundlerConfigResult(val data: BundlerConfigData, val file: File)
