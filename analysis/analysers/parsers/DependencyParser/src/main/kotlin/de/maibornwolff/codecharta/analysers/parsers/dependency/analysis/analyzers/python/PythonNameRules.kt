package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclarationNames
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DefaultNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.ProjectNames

/**
 * The name rules of `docs/name-resolution/python.md`. The analyzer writes a name behind an imported module as the path
 * of the module plus the name, which means exactly that declaration; a simple name still follows the shared rules.
 */
internal object PythonNameRules : NameRules {
    private const val SEPARATOR = "."

    override fun namesOf(node: Node, project: ProjectNames): DeclarationNames {
        val sharedRules = DefaultNameRules.namesOf(node, project)
        return DeclarationNames { name -> if (name.contains(SEPARATOR)) exactly(name, project) else sharedRules.resolve(name) }
    }

    private fun exactly(name: String, project: ProjectNames): Path {
        val plainName = name.substringAfterLast(SEPARATOR)
        return project.projectDictionary[plainName].orEmpty().find { it.withDots() == name } ?: Path.unknown(plainName)
    }
}
