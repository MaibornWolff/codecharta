package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclarationNames
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.ProjectNames

/**
 * The name rules of `docs/name-resolution/cpp.md`. The analyzer has looked every use up in the include closure of its
 * file and written it as the path of the declaration it means, so a written name means exactly the declaration of
 * that path.
 */
internal object CppNameRules : NameRules {
    private const val SEPARATOR = "."

    override fun namesOf(node: Node, project: ProjectNames): DeclarationNames = DeclarationNames { name -> exactly(name, project) }

    private fun exactly(name: String, project: ProjectNames): Path {
        val plainName = name.substringAfterLast(SEPARATOR)
        return project.projectDictionary[plainName].orEmpty().find { it.withDots() == name } ?: Path.unknown(plainName)
    }
}
