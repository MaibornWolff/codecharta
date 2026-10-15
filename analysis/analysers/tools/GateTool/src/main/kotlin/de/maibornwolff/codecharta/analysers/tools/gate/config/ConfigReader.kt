package de.maibornwolff.codecharta.analysers.tools.gate.config

import org.yaml.snakeyaml.Yaml
import org.yaml.snakeyaml.error.MarkedYAMLException
import org.yaml.snakeyaml.nodes.Node
import java.io.File
import java.io.StringReader

data class ConfigReadResult(val config: GateConfig, val problems: List<ConfigProblem>)

class ConfigReader(private val knownAnalysers: Set<String>) {
    fun read(file: File): ConfigReadResult = read(file.readText())

    fun read(text: String): ConfigReadResult {
        val root =
            try {
                Yaml().compose(StringReader(text))
            } catch (exception: MarkedYAMLException) {
                return syntaxFailure(exception)
            } ?: return ConfigReadResult(GateConfig(), emptyList())

        val nodes = YamlNodes()
        val config = readConfig(root, nodes)
        return ConfigReadResult(config, nodes.problems)
    }

    private fun syntaxFailure(exception: MarkedYAMLException): ConfigReadResult {
        val mark = exception.problemMark ?: exception.contextMark
        val line = (mark?.line ?: 0) + 1
        val problem = ConfigProblem(line, "the file is not valid YAML: ${exception.problem ?: exception.context}")
        return ConfigReadResult(GateConfig(), listOf(problem))
    }

    private fun readConfig(root: Node, nodes: YamlNodes): GateConfig {
        val sections = nodes.entries(root, "", TOP_LEVEL_KEYS) ?: return GateConfig()
        val ruleReader = MetricRuleReader(nodes)
        return GateConfig(
            output = sections[OUTPUT]?.let { nodes.text(it.value, OUTPUT) } ?: GateConfig.DEFAULT_OUTPUT,
            analysers = sections[ANALYSERS]?.let { readAnalysers(it.value, nodes) } ?: emptyMap(),
            exitCodes = GateConfig.DEFAULT_EXIT_CODES + (sections[EXIT_CODES]?.let { readExitCodes(it.value, nodes) } ?: emptyMap()),
            metrics = sections[METRICS]?.let { ruleReader.readMetrics(it.value, METRICS) } ?: emptyMap(),
            cycles = sections[CYCLES]?.let { CycleRuleReader(nodes).read(it.value, CYCLES) } ?: CycleRules(),
            overrides = sections[OVERRIDES]?.let { ruleReader.readOverrides(it.value, OVERRIDES) } ?: emptyList()
        )
    }

    private fun readAnalysers(node: Node, nodes: YamlNodes): Map<String, Boolean> {
        val entries = nodes.entries(node, ANALYSERS, knownAnalysers) ?: return emptyMap()
        return entries.values
            .mapNotNull { entry -> nodes.switch(entry.value, "$ANALYSERS.${entry.key}")?.let { entry.key to it } }
            .toMap()
    }

    private fun readExitCodes(node: Node, nodes: YamlNodes): Map<Severity, Int> {
        val entries = nodes.entries(node, EXIT_CODES, Severity.entries.map { it.key }) ?: return emptyMap()
        return entries.values
            .mapNotNull { entry -> readExitCode(entry, nodes)?.let { Severity.ofKey(entry.key)!! to it } }
            .toMap()
    }

    private fun readExitCode(entry: YamlEntry, nodes: YamlNodes): Int? {
        val path = "$EXIT_CODES.${entry.key}"
        val value = nodes.text(entry.value, path) ?: return null.also { nodes.report(entry.keyNode, "$path needs a number") }
        val exitCode = value.toIntOrNull()?.takeIf { it in EXIT_CODE_RANGE }
        return when (exitCode) {
            null -> null.also { nodes.report(entry.value, "$path must be a whole number from 0 to 255, found '$value'") }
            GateConfig.TOOL_FAILURE_EXIT_CODE -> null.also {
                nodes.report(entry.value, "$path must not be $exitCode, that code is reserved for tool failures")
            }
            else -> exitCode
        }
    }

    companion object {
        private const val OUTPUT = "output"
        private const val ANALYSERS = "analysers"
        private const val EXIT_CODES = "exitCodes"
        private const val METRICS = "metrics"
        private const val CYCLES = "cycles"
        private const val OVERRIDES = "overrides"
        private val TOP_LEVEL_KEYS = listOf(OUTPUT, ANALYSERS, EXIT_CODES, METRICS, CYCLES, OVERRIDES)
        private val EXIT_CODE_RANGE = 0..255
    }
}
