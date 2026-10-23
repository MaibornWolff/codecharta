package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclarationNames
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.ProjectNames

/**
 * The name rules of `docs/name-resolution/go.md`. [GoImports] has written a selector through an import as the full
 * path of the declaration it names, and the extractor has left out the names the enclosing function declares (rule 1),
 * so a written name is either such a path or a simple name for rules 2 to 4; a predeclared identifier (rule 4) means
 * its entry of the language dictionary, which draws no edge.
 */
internal object GoNameRules : NameRules {
    private const val SEPARATOR = "."

    override fun namesOf(node: Node, project: ProjectNames): DeclarationNames {
        val ownPackage = node.pathWithName.withoutName()
        val dotImportedPackages = node.dependencies.filter { it.isDotImport }.map { it.path.parts }
        return DeclarationNames { name ->
            val plainName = name.substringAfterLast(SEPARATOR)
            val candidates = project.projectDictionary[plainName].orEmpty().filter {
                project.fileScopedPaths.isVisible(
                    it,
                    node.physicalPath
                )
            }
            val declaration = if (name.contains(SEPARATOR)) {
                candidates.find { it.withDots() == name }
            } else {
                candidates.find { it.withoutName() == ownPackage } ?: dotImported(plainName, candidates, dotImportedPackages)
            }
            declaration ?: project.languageDictionary[plainName] ?: Path.unknown(plainName)
        }
    }

    // Rule 3: exported names only; two dot-imported packages that declare the name make it ambiguous
    private fun dotImported(name: String, candidates: List<Path>, dotImportedPackages: List<List<String>>): Path? {
        if (!name.first().isUpperCase()) return null
        return candidates.filter { it.withoutName() in dotImportedPackages }.distinct().singleOrNull()
    }
}
