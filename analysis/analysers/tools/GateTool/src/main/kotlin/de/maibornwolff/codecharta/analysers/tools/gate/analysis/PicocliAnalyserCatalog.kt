package de.maibornwolff.codecharta.analysers.tools.gate.analysis

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.tools.gate.config.AnalyserCatalog
import picocli.CommandLine

class PicocliAnalyserCatalog(private val createAnalysers: () -> List<AnalyserInterface>) : AnalyserCatalog {
    override val names: List<String> by lazy { createAnalysers().map { it.name } }

    private val optionNamesByAnalyser = mutableMapOf<String, List<String>>()

    override fun optionNames(analyser: String): List<String> = optionNamesByAnalyser.getOrPut(analyser) { longOptionNamesOf(analyser) }

    private fun longOptionNamesOf(analyser: String): List<String> = CommandLine(create(analyser))
        .commandSpec
        .options()
        .filterNot { it.usageHelp() || it.versionHelp() || it.hidden() }
        .map { it.longestName() }
        .filter { it.startsWith(LONG_OPTION_PREFIX) }
        .map { it.removePrefix(LONG_OPTION_PREFIX) }
        .filterNot { it in OPTIONS_SET_BY_THE_GATE }

    override fun checkArguments(analyser: String, arguments: List<String>): String? = try {
        CommandLine(create(analyser)).parseArgs(*(listOf(PLACEHOLDER_INPUT) + arguments).toTypedArray())
        null
    } catch (exception: CommandLine.ParameterException) {
        exception.message
    }

    private fun create(analyser: String): AnalyserInterface = createAnalysers().first { it.name == analyser }

    companion object {
        private const val LONG_OPTION_PREFIX = "--"
        private const val PLACEHOLDER_INPUT = "."
        private val OPTIONS_SET_BY_THE_GATE = setOf("output-file", "not-compressed")
    }
}
