package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.resolveImportPath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.api.UsedType

abstract class BaseLanguageAnalyzer(protected val fileInfo: FileInfo) : LanguageAnalyzer {
    protected abstract val language: SupportedLanguage

    protected open fun tseLanguage(): Language = Language.valueOf(language.name)

    override fun analyze(): FileReport {
        val result = TreeSitterDependencies.analyze(fileInfo.content, tseLanguage())
        val nodes = result.declarations.map { declaration ->
            val selectedImports = selectImports(declaration, result.imports)
            val importDeps = selectedImports.flatMap { convertImport(it) }.toSet()
            val packageDep = if (result.packagePath.isNotEmpty()) {
                setOf(Dependency(path = Path(result.packagePath), isWildcard = true))
            } else {
                emptySet()
            }
            val dependencies = importDeps + packageDep + extraDependencies(declaration)
            toNode(result.packagePath, dependencies, declaration)
        }
        return FileReport(nodes)
    }

    protected open fun selectImports(declaration: Declaration, imports: List<ImportDeclaration>): List<ImportDeclaration> = imports

    protected open fun convertImport(import: ImportDeclaration): Set<Dependency> = setOf(import.toDependency())

    protected fun resolveImportPath(tsePath: List<String>): List<String> = resolveImportPath(tsePath, fileInfo)

    protected open fun buildPathWithName(packagePath: List<String>, declaration: Declaration): Path = Path(packagePath + declaration.name)

    protected open fun extraDependencies(declaration: Declaration): Set<Dependency> = emptySet()

    protected open fun selectUsedTypes(declaration: Declaration): Set<UsedType> = declaration.usedTypes

    private fun toNode(packagePath: List<String>, dependencies: Set<Dependency>, declaration: Declaration): Node = Node(
        pathWithName = buildPathWithName(packagePath, declaration),
        physicalPath = fileInfo.physicalPath,
        language = language,
        nodeType = declaration.type.toNodeType(),
        dependencies = dependencies,
        usedTypes = selectUsedTypes(declaration).map { it.toType() }.toSet()
    )
}
