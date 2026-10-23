package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.javascript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.BaseLanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_DEFAULT_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.withoutFileSuffix
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.defaultImportPath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.DefaultExports
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.ImportedModules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.MemberImports
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.ModuleScriptUses
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.ScriptLeaf
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.UsedType

// Unlike TypescriptAnalyzer, JavascriptAnalyzer does not expand wildcard re-exports
// (`export * from './module'`) into one node per re-exported name. A JS wildcard re-export is
// represented as a single REEXPORT node carrying the wildcard dependency. This matches DC's
// established JavaScript behavior (see the `should handle ES6 wildcard re-exports` test).
class JavascriptAnalyzer(fileInfo: FileInfo) : BaseLanguageAnalyzer(fileInfo) {
    override val language = SupportedLanguage.JAVASCRIPT
    private val memberImports = fileInfo.analysisRoot?.let { MemberImports(it) }

    override fun buildPathWithName(packagePath: List<String>, declaration: Declaration): Path {
        val extension = fileInfo.physicalPath.substringAfterLast('.', "").lowercase()
        val modulePath = fileInfo.physicalPathAsPath().withoutFileSuffix(extension)
        if (declaration.type == DeclarationType.SCRIPT) return ScriptLeaf.pathIn(modulePath)
        return modulePath + localExportName(declaration.name)
    }

    override fun selectUsedTypes(declaration: Declaration, imports: List<ImportDeclaration>): Set<UsedType> =
        ModuleScriptUses.of(declaration.usedTypes, fileInfo)

    override fun analyze(): FileReport {
        val declaredNodes = super.analyze().nodes.let { memberImports?.rewrite(it) ?: it }
        return FileReport(DefaultExports.withoutOwnNames(declaredNodes))
    }

    override fun convertImport(import: ImportDeclaration): Set<Dependency> {
        val analysisRoot = fileInfo.analysisRoot
        val moduleFile = ImportedModules.fileOf(import, fileInfo)
        if (analysisRoot != null && moduleFile != null) {
            val module = ImportedModules.logicalPathOf(moduleFile, analysisRoot)
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
        return setOf(Dependency(path = Path(resolvedPath), isWildcard = import.isWildcard))
    }

    // TSE marks the default export/import with a sentinel name; JavaScript represents the default
    // binding as `default` in both node paths and dependency paths.
    private fun localExportName(tseName: String): String = if (tseName == TSE_DEFAULT_EXPORT_NAME) DefaultExports.LEAF_NAME else tseName
}
