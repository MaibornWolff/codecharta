package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toNodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.splitNameToParts
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
    private val modules = fileInfo.analysisRoot?.let { GoModules.of(it) }
    private val folder = splitNameToParts(fileInfo.physicalPath).filter { it != CURRENT_FOLDER }.dropLast(1)

    override fun analyze(): FileReport {
        val result = TreeSitterDependencies.analyze(fileInfo.content, Language.GO)
        val declaredPackageNames = result.packagePath
        val importablePackagePath = GoPackagePath.derive(fileInfo.physicalPath, declaredPackageNames)
        val ownPackage = Dependency(Path(declaredPackageNames))
        val dependencies = (result.imports.map { it.toGoDependency() } + ownPackage).toSet()
        val imports = GoImports(result.imports, ::folderOf) { modules?.packageNameOf(it) }
        val nodes = result.declarations.map { declaration ->
            Node(
                pathWithName = Path(importablePackagePath + declaration.name),
                physicalPath = fileInfo.physicalPath,
                language = fileInfo.language,
                nodeType = declaration.type.toNodeType(),
                dependencies = dependencies,
                usedTypes = declaration.usedTypes.mapNotNull { imports.nameOf(it) }.map { untrimmedType(it) }.toSet()
            )
        }
        return FileReport(nodes)
    }

    // A name next to a missing token can start with a line break, which Type.simple would trim away
    private fun untrimmedType(name: String) = Type(name, TypeOfUsage.USAGE, emptyList())

    // The folder of a project package; for a library, or without an analysis root, the import path as written
    private fun ImportDeclaration.toGoDependency() =
        Dependency(Path(folderOf(this) ?: path), isWildcard = isWildcard, isDotImport = isWildcard)

    private fun folderOf(import: ImportDeclaration): List<String>? = modules?.folderOf(import.path, folder)

    companion object {
        private const val CURRENT_FOLDER = "."
    }
}
