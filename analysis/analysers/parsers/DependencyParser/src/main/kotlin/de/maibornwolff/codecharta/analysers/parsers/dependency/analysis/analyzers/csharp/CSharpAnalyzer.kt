package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.ImportAliases
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toDependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toNodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies

class CSharpAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    override fun analyze(): FileReport {
        val result = TreeSitterDependencies.analyze(fileInfo.content, Language.CSHARP)
        val typePaths = result.declarations.map { it.parentPath + it.name }.toSet()

        val nodes = result.declarations.map { declaration ->
            val namespacePath = namespaceOf(declaration.parentPath, typePaths)
            // The using directives of every namespace declaration around the type, each with the namespace it is written in
            val visibleImports = result.imports.filter { namespacePath.take(it.namespacePath.size) == it.namespacePath }
            // A using alias imports nothing; ImportAliases replaces it in the names it is written in
            val usings = visibleImports
                .filter { it.bindingName == null }
                .map { it.toDependency().copy(scope = it.namespacePath) }
            val ownScopes = listOf(namespacePath, declaration.parentPath).map { Dependency(path = Path(it), isWildcard = true) }
            val dependencies = (usings + ownScopes).toSet()

            Node(
                pathWithName = Path(declaration.parentPath + declaration.name),
                physicalPath = fileInfo.physicalPath,
                language = SupportedLanguage.C_SHARP,
                nodeType = declaration.type.toNodeType(),
                dependencies = dependencies,
                usedTypes = ImportAliases.resolve(declaration.usedTypes, visibleImports).map { it.toType() }.toSet()
            )
        }
        return FileReport(nodes)
    }

    // The parent path of a nested type ends with the types around it, which are no namespace
    private fun namespaceOf(parentPath: List<String>, typePaths: Set<List<String>>): List<String> {
        var namespacePath = parentPath
        while (namespacePath in typePaths) namespacePath = namespacePath.dropLast(1)
        return namespacePath
    }
}
