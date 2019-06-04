package de.maibornwolff.codecharta.filter.structuremodifier

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Project

class ProjectStructurePrinter(private val project: Project) {

    fun printProjectStructure(maxDepth: Int) {
        println("${project.projectName}:")
        println("-".repeat(project.projectName.length + 1))
        printNodeRecursively(maxDepth, 0, project.rootNode.toMutableNode())
    }

    private fun printNodeRecursively(maxDepth: Int, currentDepth: Int, node: MutableNode) {
        if (maxDepth < currentDepth) return

        println("- ".repeat(currentDepth) + node.name)
        node.children.forEach { printNodeRecursively(maxDepth, currentDepth + 1, it) }
    }
}