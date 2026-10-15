package de.maibornwolff.codecharta.analysers.tools.gate.config

import org.yaml.snakeyaml.nodes.Node

class AnalyserSettingsReader(private val nodes: YamlNodes, private val catalog: AnalyserCatalog) {
    fun read(node: Node, path: String): Map<String, AnalyserSetting> = nodes.readMap(node, path, catalog.names, ::readSetting)

    private fun readSetting(entry: YamlEntry, path: String): AnalyserSetting? {
        if (nodes.isScalar(entry.value)) return nodes.switch(entry.value, path)?.let { AnalyserSetting(it) }
        val options = nodes.entries(entry.value, path) ?: return null
        return AnalyserSetting(true, options.values.flatMap { readOption(entry.key, it, YamlNodes.childPath(path, it.key)) })
    }

    private fun readOption(analyser: String, option: YamlEntry, path: String): List<String> {
        val knownOptions = catalog.optionNames(analyser)
        if (option.key !in knownOptions) {
            nodes.report(option.keyNode, "$analyser has no option '${option.key}', expected one of: ${knownOptions.joinToString()}")
            return emptyList()
        }
        val arguments = toArguments(analyser, option, path) ?: return emptyList()
        val refusal = catalog.checkArguments(analyser, arguments) ?: return arguments
        nodes.report(option.value, "$path: $refusal")
        return emptyList()
    }

    private fun toArguments(analyser: String, option: YamlEntry, path: String): List<String>? {
        val flag = "--${option.key}"
        val value = option.value
        if (nodes.isEmpty(value)) return listOf(flag)
        if (nodes.isList(value)) return nodes.texts(value, path)?.map { "$flag=$it" }
        val text = nodes.text(value, path) ?: return null
        return when {
            !catalog.isFlag(analyser, option.key) -> listOf("$flag=$text")
            YamlNodes.isOn(text) -> listOf(flag)
            YamlNodes.isOff(text) -> emptyList()
            else -> listOf("$flag=$text")
        }
    }
}
