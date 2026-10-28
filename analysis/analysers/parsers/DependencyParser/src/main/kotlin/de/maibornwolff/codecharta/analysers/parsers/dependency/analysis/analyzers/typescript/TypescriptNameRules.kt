package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclarationNames
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.ProjectNames

/**
 * The name rules of `docs/name-resolution/typescript.md`, for TypeScript, JavaScript and Vue. The extractor has found
 * the binding the compiler sees for every name, and the analyzer has written each use as the full path of what that
 * binding names, so a written name means exactly the declaration of that path; a name left simple no binding of the
 * project binds, and means none.
 */
internal object TypescriptNameRules : NameRules {
    private const val SEPARATOR = "."

    override fun namesOf(node: Node, project: ProjectNames): DeclarationNames = DeclarationNames { name -> exactly(name, project) }

    private fun exactly(name: String, project: ProjectNames): Path {
        val plainName = name.substringAfterLast(SEPARATOR)
        return project.projectDictionary[plainName].orEmpty().find { it.withDots() == name } ?: Path.unknown(plainName)
    }
}
