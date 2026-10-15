package de.maibornwolff.codecharta.analysers.tools.gate.config

interface AnalyserCatalog {
    val names: List<String>

    fun optionNames(analyser: String): List<String>

    fun checkArguments(analyser: String, arguments: List<String>): String?
}
