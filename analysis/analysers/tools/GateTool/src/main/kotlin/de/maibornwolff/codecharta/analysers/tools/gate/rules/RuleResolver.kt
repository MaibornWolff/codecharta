package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.analyserinterface.gitignore.GitignorePatternMatcher
import de.maibornwolff.codecharta.analysers.analyserinterface.gitignore.GitignoreRule
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.LevelRule
import de.maibornwolff.codecharta.analysers.tools.gate.config.MetricOverride
import de.maibornwolff.codecharta.analysers.tools.gate.config.PathOverride
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import java.io.File
import java.nio.file.Path

typealias LevelRules = Map<Severity, LevelRule>

class RuleResolver(private val config: GateConfig) {
    private val patternParser = GitignorePatternMatcher(File("."))
    private val overridePatterns: List<Pair<List<GitignoreRule>, PathOverride>> =
        config.overrides.map { override -> override.paths.mapNotNull(patternParser::parsePattern) to override }

    fun rulesFor(path: String): Map<String, LevelRules> {
        val rules = config.metrics.mapValues { (_, rule) -> rule.levels }.toMutableMap()
        overridePatterns
            .filter { (patterns, _) -> patterns.any { matchesFileOrFolder(it, path) } }
            .forEach { (_, override) -> override.metrics.forEach { (metric, change) -> applyOverride(rules, metric, change) } }
        return rules.filterValues { it.isNotEmpty() }
    }

    private fun applyOverride(rules: MutableMap<String, LevelRules>, metric: String, change: MetricOverride) {
        when (change) {
            MetricOverride.Off -> rules.remove(metric)
            is MetricOverride.Levels -> rules[metric] = overriddenLevels(rules[metric] ?: emptyMap(), change)
        }
    }

    private fun overriddenLevels(levels: LevelRules, change: MetricOverride.Levels): LevelRules {
        val changedLevels = change.levels.mapNotNull { (severity, levelOverride) ->
            val current = levels[severity]
            val max = levelOverride.max ?: current?.max ?: return@mapNotNull null
            severity to LevelRule(max, levelOverride.message ?: current?.message)
        }
        return levels + changedLevels
    }

    private fun matchesFileOrFolder(pattern: GitignoreRule, path: String): Boolean {
        val segments = path.split(PATH_SEPARATOR)
        return (1..segments.size).any { segmentCount ->
            val isFolder = segmentCount < segments.size
            pattern.matches(Path.of(segments.take(segmentCount).joinToString(PATH_SEPARATOR)), isFolder)
        }
    }

    companion object {
        private const val PATH_SEPARATOR = "/"
    }
}
