package de.maibornwolff.codecharta.filter.structuremodifier

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Project
import java.io.PrintStream

class ProjectStructurePrinter(private val project: Project, private val output: PrintStream = System.out) {

    fun printProjectStructure(maxDepth: Int) {
        output.println("${project.projectName}:")
        output.println("-".repeat(project.projectName.length + 1))
        printNodeRecursively(maxDepth, 0, project.rootNode.toMutableNode())
    }

    private fun printNodeRecursively(maxDepth: Int, currentDepth: Int, node: MutableNode) {
        if (maxDepth < currentDepth) return

        output.println("- ".repeat(currentDepth) + node.name)
        node.children.forEach { printNodeRecursively(maxDepth, currentDepth + 1, it) }
    }
}