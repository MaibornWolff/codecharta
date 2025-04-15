package de.maibornwolff.codecharta.analysers.analyserinterface.util

class CodeChartaConstants {
    companion object {
        /**
         * Contains current copyright notice, e.g. 'Copyright(c) 2025, MaibornWolff GmbH'
         */
        const val GENERIC_FOOTER = "Copyright(c) 2025, MaibornWolff GmbH"

        /**
         * Contains the flag an analyser sends to signal they started execution
         */
        const val EXECUTION_STARTED_SYNC_FLAG = "\u000E\u000E\u000E\u000E\u000E\u000E\u000E\u000E\u000E\u000E\u000E\u000E"
    }
}
