package de.maibornwolff.codecharta.analysers.tools.gate.config

class FakeAnalyserCatalog(private val optionsByAnalyser: Map<String, List<String>>, private val flags: Set<String> = emptySet()) :
    AnalyserCatalog {
    override val names: List<String> get() = optionsByAnalyser.keys.toList()

    override fun optionNames(analyser: String): List<String> = optionsByAnalyser.getValue(analyser)

    override fun checkArguments(analyser: String, arguments: List<String>): String? =
        if (arguments.any { it.endsWith("=lots") }) "Invalid value: 'lots' is not an int" else null

    override fun isFlag(analyser: String, option: String): Boolean = option in flags
}
