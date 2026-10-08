package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toNodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.TypeOfUsage
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies

class GoAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    override fun analyze(): FileReport {
        val result = TreeSitterDependencies.analyze(fileInfo.content, Language.GO)
        val declaredPackageNames = result.packagePath
        val importablePackagePath = GoPackagePath.derive(fileInfo.physicalPath, declaredPackageNames)
        val ownPackage = Dependency(Path(declaredPackageNames))
        val dependencies = (result.imports.map { it.toGoDependency() } + ownPackage).toSet()
        val nodes = result.declarations.map { declaration ->
            Node(
                pathWithName = Path(importablePackagePath + declaration.name),
                physicalPath = fileInfo.physicalPath,
                language = fileInfo.language,
                nodeType = declaration.type.toNodeType(),
                dependencies = dependencies,
                usedTypes = declaration.usedTypes.map { untrimmedType(it.name) }.toSet()
            )
        }
        return FileReport(nodes)
    }

    // A name next to a missing token can start with a line break, which Type.simple would trim away
    private fun untrimmedType(name: String) = Type(name, TypeOfUsage.USAGE, emptyList())

    private fun ImportDeclaration.toGoDependency() = Dependency(Path(path), isWildcard = isWildcard, isDotImport = isWildcard)
}
