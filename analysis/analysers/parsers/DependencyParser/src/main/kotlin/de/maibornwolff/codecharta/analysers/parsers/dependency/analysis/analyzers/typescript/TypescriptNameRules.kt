package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclarationNames
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DefaultNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.ProjectNames

/** The name rules of `docs/name-resolution/typescript.md`, for TypeScript, JavaScript and Vue. */
internal object TypescriptNameRules : NameRules {
    override fun namesOf(node: Node, project: ProjectNames): DeclarationNames = DefaultNameRules.namesOf(node, project)
}
