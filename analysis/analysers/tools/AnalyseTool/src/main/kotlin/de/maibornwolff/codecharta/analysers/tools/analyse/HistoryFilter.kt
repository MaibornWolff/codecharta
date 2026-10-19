package de.maibornwolff.codecharta.analysers.tools.analyse

import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project

/** Keeps only the history of the files the code parsers mapped, so excluded, ignored and binary files stay out. */
object HistoryFilter {
    fun keepFilesOf(code: Project, history: Project): Project {
        val codeFiles = filesOf(code)
        val root = keptNode(history.rootNode, emptyList(), codeFiles) ?: Node(history.rootNode.name, NodeType.Folder)
        val dependency = history.lenses.dependency
        val edges = dependency.edges.filter { isCodeFile(it.fromNodeName, codeFiles) && isCodeFile(it.toNodeName, codeFiles) }
        val lenses = history.lenses.copy(dependency = dependency.copy(edges = edges))
        return Project(history.projectName, listOf(root), history.apiVersion, lenses, history.blacklist, history.commitHash)
    }

    private fun filesOf(project: Project): Set<List<String>> = project.rootNode.nodes
        .filter { (_, node) -> node.type == NodeType.File }
        .keys
        .map { NodeId.canonicalSegments(it.edgesList) }
        .toSet()

    private fun isCodeFile(endpoint: String, codeFiles: Set<List<String>>): Boolean = NodeId.segmentsFromEndpoint(endpoint) in codeFiles

    private fun keptNode(node: Node, path: List<String>, codeFiles: Set<List<String>>): Node? {
        if (node.type == NodeType.File) return node.takeIf { NodeId.canonicalSegments(path) in codeFiles }
        val children = node.children.mapNotNull { keptNode(it, path + it.name, codeFiles) }.toSet()
        if (children.isEmpty()) return null
        return Node(node.name, node.type, node.attributes, node.link, children, node.checksum)
    }
}
