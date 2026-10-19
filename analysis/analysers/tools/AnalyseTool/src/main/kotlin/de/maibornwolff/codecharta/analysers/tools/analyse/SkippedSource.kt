package de.maibornwolff.codecharta.analysers.tools.analyse

data class SkippedSource(val name: String, val reason: String) {
    companion object {
        const val LEFT_OUT_REASON = "left out with --without"
    }
}
