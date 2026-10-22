package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp

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
        val globalImports = result.imports.filter { it.namespacePath.isEmpty() }.map { it.toDependency() }
        val typePaths = result.declarations.map { it.parentPath + it.name }.toSet()

        val nodes = result.declarations.map { declaration ->
            val namespacePath = namespaceOf(declaration.parentPath, typePaths)
            val scopedImports = result.imports
                .filter { it.namespacePath == namespacePath }
                .map { it.toDependency() }
            val ownScopes = listOf(namespacePath, declaration.parentPath).map { Dependency(path = Path(it), isWildcard = true) }
            val dependencies = (globalImports + scopedImports + ownScopes).toSet()

            Node(
                pathWithName = Path(declaration.parentPath + declaration.name),
                physicalPath = fileInfo.physicalPath,
                language = SupportedLanguage.C_SHARP,
                nodeType = declaration.type.toNodeType(),
                dependencies = dependencies,
                usedTypes = declaration.usedTypes.map { it.toType() }.toSet()
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
