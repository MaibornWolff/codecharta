package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project

data class AnalysedFile(val path: String, val metrics: Map<String, Double>)

data class FileDependency(val from: String, val to: String)

class AnalysedProject(private val project: Project) {
    val files: List<AnalysedFile> by lazy {
        project.rootNode.nodes
            .filter { (_, node) -> node.type == NodeType.File }
            .map { (path, node) -> AnalysedFile(path.edgesList.joinToString(PATH_SEPARATOR), numericAttributes(node.attributes)) }
    }

    val dependencies: List<FileDependency> by lazy {
        val rootPrefix = "$PATH_SEPARATOR${project.rootNode.name}$PATH_SEPARATOR"
        project.lenses.dependency.edges.map { edge ->
            FileDependency(edge.fromNodeName.removePrefix(rootPrefix), edge.toNodeName.removePrefix(rootPrefix))
        }
    }

    private fun numericAttributes(attributes: Map<String, Any>): Map<String, Double> = attributes
        .mapNotNull { (name, value) -> (value as? Number)?.let { name to it.toDouble() } }
        .toMap()

    companion object {
        private const val PATH_SEPARATOR = "/"
    }
}
