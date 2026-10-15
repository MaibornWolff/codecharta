package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.tools.gate.config.ConfigKeys
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import de.maibornwolff.codecharta.analysers.tools.gate.config.YamlNodes.Companion.childPath

class UnmatchedPatternFinder(private val filePaths: List<String>) {
    fun find(config: GateConfig): List<Violation> = patternsBySetting(config).flatMap { (setting, patterns) ->
        patterns
            .filterNot { it.startsWith(NEGATION) || matchesAnyFile(it) }
            .map { UnmatchedPattern(Severity.WARNING, INSTRUCTION, it, setting) }
    }

    private fun matchesAnyFile(pattern: String): Boolean {
        val patterns = PathPatterns(listOf(pattern))
        return filePaths.any(patterns::matches)
    }

    private fun patternsBySetting(config: GateConfig): List<Pair<String, List<String>>> {
        val dependencyRules = config.dependencies
        val ignored = listOf(
            ConfigKeys.CYCLES_BETWEEN_FILES to dependencyRules.cyclesBetweenFiles,
            ConfigKeys.CYCLES_INSIDE_FILES to dependencyRules.cyclesInsideFiles,
            ConfigKeys.UPWARD to dependencyRules.upward
        ).mapNotNull { (key, rule) -> rule?.let { childPath(childPath(ConfigKeys.DEPENDENCIES, key), ConfigKeys.IGNORE) to it.ignore } }
        val overridden = config.overrides.mapIndexed { index, override ->
            childPath("${ConfigKeys.OVERRIDES}[$index]", ConfigKeys.PATHS) to
                override.paths
        }
        return listOf(ConfigKeys.EXCLUDE to config.exclude) + ignored + overridden
    }

    companion object {
        private const val NEGATION = "!"
        private const val INSTRUCTION =
            "Check these patterns against the paths in the report: they are relative to the input folder and use '/' between folders."
    }
}
