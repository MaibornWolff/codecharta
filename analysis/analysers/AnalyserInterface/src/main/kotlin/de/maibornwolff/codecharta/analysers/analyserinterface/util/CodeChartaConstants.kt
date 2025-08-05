package de.maibornwolff.codecharta.analysers.analyserinterface.util

class CodeChartaConstants {
    companion object {
        /**
         * Contains current copyright notice, e.g. 'Copyright(c) 2025, MaibornWolff GmbH'
         */
        const val GENERIC_FOOTER = "Copyright(c) 2025, MaibornWolff GmbH"

        /**
         * Contains the flag an analyser sends to signal they started execution.
         * As the result is always a json, we send this already to show an analyser is running
         */
        const val EXECUTION_STARTED_SYNC_FLAG = "\u000E\u000E\u000E\u000E\u000E\u000E\u000E\u000E\u000E\u000E\u000E\u000E"

        /**
         * Contains folders and patterns that analysers exclude by default
         */
        val BUILD_FOLDERS = arrayOf("/out/", "/build/", "/target/", "/dist/", "/resources/", "/node_modules/", "(/|^)\\..*")
    }
}
