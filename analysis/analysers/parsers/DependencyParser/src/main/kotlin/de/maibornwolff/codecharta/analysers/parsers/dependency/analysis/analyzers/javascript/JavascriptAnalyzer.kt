package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.javascript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.BaseLanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_DEFAULT_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.withoutFileSuffix
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.defaultImportPath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.DefaultExportUses
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.DefaultExports
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.GlobalUses
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.ImportedModules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.MemberImports
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.ModuleScriptUses
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.OwnNames
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.ScriptLeaf
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.StarExports
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.UsedType

class JavascriptAnalyzer(fileInfo: FileInfo) : BaseLanguageAnalyzer(fileInfo) {
    override val language = SupportedLanguage.JAVASCRIPT
    private val memberImports = fileInfo.analysisRoot?.let { MemberImports(it) }
    private val starExports = fileInfo.analysisRoot?.let { StarExports(it) }
    private val modulePath by lazy {
        fileInfo.physicalPathAsPath().withoutFileSuffix(fileInfo.physicalPath.substringAfterLast('.', "").lowercase())
    }

    override fun buildPathWithName(packagePath: List<String>, declaration: Declaration): Path {
        if (declaration.type == DeclarationType.SCRIPT) return ScriptLeaf.pathIn(modulePath)
        return modulePath + localExportName(declaration.name)
    }

    override fun selectUsedTypes(declaration: Declaration, imports: List<ImportDeclaration>): Set<UsedType> =
        GlobalUses.of(ModuleScriptUses.of(DefaultExportUses.of(declaration.usedTypes, fileInfo), fileInfo), fileInfo.analysisRoot)

    override fun analyze(): FileReport {
        val declaredNodes = super.analyze().nodes.let { memberImports?.rewrite(it) ?: it }
        val nodes = OwnNames.writtenInFull(DefaultExports.withoutOwnNames(declaredNodes), modulePath)
        return FileReport(starExports?.expandedIn(nodes, modulePath) ?: nodes)
    }

    override fun convertImport(import: ImportDeclaration): Set<Dependency> {
        val analysisRoot = fileInfo.analysisRoot
        val moduleFile = ImportedModules.fileOf(import, fileInfo)
        if (analysisRoot != null && moduleFile != null) {
            val module = ImportedModules.logicalPathOf(moduleFile, analysisRoot)
            starExports?.remember(import, moduleFile)
            memberImports?.targetOf(import, moduleFile, module)?.let { return setOf(Dependency(path = it)) }
            val importedName = if (ImportedModules.namesMember(
                    import
                )
            ) {
                listOf(localExportName(import.defaultImportPath().last()))
            } else {
                emptyList()
            }
            return setOf(Dependency(path = Path(module.parts + importedName), isWildcard = import.isWildcard))
        }
        val path = resolveImportPath(import.defaultImportPath())
        val resolvedPath = if (path.isEmpty()) path else path.dropLast(1) + localExportName(path.last())
        memberImports?.bindOutsideProject(import, Path(resolvedPath))
        return setOf(Dependency(path = Path(resolvedPath), isWildcard = import.isWildcard))
    }

    // TSE marks the default export/import with a sentinel name; JavaScript represents the default
    // binding as `default` in both node paths and dependency paths.
    private fun localExportName(tseName: String): String = if (tseName == TSE_DEFAULT_EXPORT_NAME) DefaultExports.LEAF_NAME else tseName
}
