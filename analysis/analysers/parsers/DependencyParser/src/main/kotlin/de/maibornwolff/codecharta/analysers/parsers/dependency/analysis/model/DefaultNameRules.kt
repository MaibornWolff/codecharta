package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

/** The rules of the languages without a page under `docs/name-resolution/`, as they were before the pages. */
internal object DefaultNameRules : NameRules {
    override fun namesOf(node: Node, project: ProjectNames): DeclarationNames {
        val resolver = TypeImportResolver(
            ImportingDeclaration(node.pathWithName, node.physicalPath, node.dependencies, node.language),
            project.projectDictionary,
            project.languageDictionary,
            project.fileScopedPaths
        )
        return DeclarationNames(resolver::resolve)
    }
}
