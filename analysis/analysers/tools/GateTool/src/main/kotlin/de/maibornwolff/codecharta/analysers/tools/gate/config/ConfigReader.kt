package de.maibornwolff.codecharta.analysers.tools.gate.config

import de.maibornwolff.codecharta.analysers.tools.gate.config.YamlNodes.Companion.bySeverity
import org.yaml.snakeyaml.Yaml
import org.yaml.snakeyaml.error.MarkedYAMLException
import org.yaml.snakeyaml.nodes.Node
import java.io.File
import java.io.StringReader

data class ConfigReadResult(val config: GateConfig, val problems: List<ConfigProblem>)

class ConfigReader(private val catalog: AnalyserCatalog, private val configFolder: File = File(".")) {
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
        val sections = nodes.entries(root, "", ConfigKeys.TOP_LEVEL) ?: return GateConfig()
        val ruleReader = MetricRuleReader(nodes)
        return GateConfig(
            input = sections[ConfigKeys.INPUT]?.let { readInput(it.value, nodes) },
            output = sections[ConfigKeys.OUTPUT]?.let { nodes.text(it.value, ConfigKeys.OUTPUT) } ?: GateConfig.DEFAULT_OUTPUT,
            parallel = sections[ConfigKeys.PARALLEL]?.let { nodes.switch(it.value, ConfigKeys.PARALLEL) } ?: false,
            analysers =
                sections[ConfigKeys.ANALYSERS]?.let { AnalyserSettingsReader(nodes, catalog).read(it.value, ConfigKeys.ANALYSERS) }
                    ?: emptyMap(),
            exitCodes = sections[ConfigKeys.EXIT_CODES]?.let { readExitCodes(it.value, nodes) } ?: emptyMap(),
            metrics = sections[ConfigKeys.METRICS]?.let { ruleReader.readMetrics(it.value, ConfigKeys.METRICS) } ?: emptyMap(),
            cycles = sections[ConfigKeys.CYCLES]?.let { CycleRuleReader(nodes).read(it.value, ConfigKeys.CYCLES) } ?: CycleRules(),
            overrides = sections[ConfigKeys.OVERRIDES]?.let { ruleReader.readOverrides(it.value, ConfigKeys.OVERRIDES) } ?: emptyList()
        )
    }

    private fun readInput(node: Node, nodes: YamlNodes): String? {
        val input = nodes.text(node, ConfigKeys.INPUT) ?: return null
        if (!GateConfig.resolve(configFolder, input).isDirectory) nodes.report(node, "${ConfigKeys.INPUT} folder '$input' does not exist")
        return input
    }

    private fun readExitCodes(node: Node, nodes: YamlNodes): Map<Severity, Int> = nodes
        .readMap(
            node,
            ConfigKeys.EXIT_CODES,
            Severity.entries.map { it.key }
        ) { entry, path -> readExitCode(entry, path, nodes) }
        .bySeverity()

    private fun readExitCode(entry: YamlEntry, path: String, nodes: YamlNodes): Int? {
        if (nodes.isEmpty(entry.value)) {
            nodes.report(entry.keyNode, "$path needs a number")
            return null
        }
        val value = nodes.text(entry.value, path) ?: return null
        val exitCode = value.toIntOrNull()?.takeIf { it in EXIT_CODE_RANGE }
        val problem = when (exitCode) {
            null -> "$path must be a whole number from 0 to 255, found '$value'"
            GateConfig.TOOL_FAILURE_EXIT_CODE -> "$path must not be $exitCode, that code is reserved for tool failures"
            else -> return exitCode
        }
        nodes.report(entry.value, problem)
        return null
    }

    companion object {
        private val EXIT_CODE_RANGE = 0..255
    }
}
