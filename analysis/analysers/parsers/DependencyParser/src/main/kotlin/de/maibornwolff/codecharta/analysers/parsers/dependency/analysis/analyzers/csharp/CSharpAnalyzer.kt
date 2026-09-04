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

        val nodes = result.declarations.map { declaration ->
            val namespacePath = declaration.parentPath
            val scopedImports = result.imports
                .filter { it.namespacePath == declaration.parentPath }
                .map { it.toDependency() }
            val dependencies = (globalImports + scopedImports + Dependency(path = Path(namespacePath), isWildcard = true)).toSet()

            Node(
                pathWithName = Path(namespacePath + declaration.name),
                physicalPath = fileInfo.physicalPath,
                language = SupportedLanguage.C_SHARP,
                nodeType = declaration.type.toNodeType(),
                dependencies = dependencies,
                usedTypes = declaration.usedTypes.map { it.toType() }.toSet()
            )
        }
        return FileReport(nodes)
    }
}
