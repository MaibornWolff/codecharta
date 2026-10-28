package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclarationNames
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.ProjectNames

/**
 * The name rules of `docs/name-resolution/php.md`. The extractor has resolved every name as the compiler does and the
 * analyzer has written it as its full path, so a written name means the declaration of exactly that path, in its
 * declared case (decision 5), or none.
 */
internal object PhpNameRules : NameRules {
    private const val SEPARATOR = "."

    override fun namesOf(node: Node, project: ProjectNames): DeclarationNames = DeclarationNames { name -> exactly(name, project) }

    private fun exactly(name: String, project: ProjectNames): Path {
        val plainName = name.substringAfterLast(SEPARATOR)
        return project.projectDictionary[plainName].orEmpty().find { it.withDots() == name } ?: Path.unknown(plainName)
    }
}
