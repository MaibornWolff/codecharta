package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclarationNames
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.ProjectNames

/**
 * The name rules of `docs/name-resolution/rust.md`. The analyzer has looked every name up in the module tree as the
 * compiler does and written it as its full path, so a written name means the declaration of exactly that path, or none.
 */
internal object RustNameRules : NameRules {
    private const val SEPARATOR = "."

    override fun namesOf(node: Node, project: ProjectNames): DeclarationNames = DeclarationNames { name -> exactly(name, project) }

    private fun exactly(name: String, project: ProjectNames): Path {
        val plainName = name.substringAfterLast(SEPARATOR)
        return project.projectDictionary[plainName].orEmpty().find { it.withDots() == name } ?: Path.unknown(plainName)
    }
}
