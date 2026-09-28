package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.BaseLanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_DEFAULT_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.WILDCARD_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.toRelativePath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.withoutFileSuffix
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.defaultImportPath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import java.io.File

class TypescriptAnalyzer(fileInfo: FileInfo) : BaseLanguageAnalyzer(fileInfo) {
    override val language = SupportedLanguage.TYPESCRIPT

    // The extension is taken from the file as spelled, so `.mts`, `.cts` and `Foo.TSX` strip cleanly.
    private val extension = fileInfo.physicalPath.substringAfterLast('.', "").lowercase()
    private val isTsx = extension == TSX_EXTENSION
    private val physicalFilePath by lazy { fileInfo.physicalPathAsPath().withoutFileSuffix(extension) }

    // A Path escapes the dots of a file name, which is not reversible, so the segments a wildcard import
    // resolved to are kept as written for the lookup on disk (`./user.service` must find `user.service.ts`).
    private val unescapedSegmentsByPath = HashMap<Path, List<String>>()

    override fun tseLanguage(): Language = if (isTsx) Language.TSX else Language.TYPESCRIPT

    override fun buildPathWithName(packagePath: List<String>, declaration: Declaration): Path {
        if (declaration.parentPath.isNotEmpty()) {
            return Path(declaration.parentPath) + declaration.name
        }
        if (declaration.name == TSE_DEFAULT_EXPORT_NAME) {
            val qualifiedName = physicalFilePath.parts.joinToString("_") + "_$TSE_DEFAULT_EXPORT_NAME"
            return physicalFilePath + qualifiedName
        }
        return physicalFilePath + declaration.name
    }

    override fun analyze(): FileReport {
        val baseReport = super.analyze()
        val analysisRoot = fileInfo.analysisRoot ?: return baseReport
        val ownNames = baseReport.nodes
            .filter { it.pathWithName.parts.lastOrNull() != WILDCARD_EXPORT_NAME }
            .mapNotNull { it.pathWithName.parts.lastOrNull() }
            .toSet()
        val nodes = baseReport.nodes.flatMap { node ->
            if (node.pathWithName.parts.lastOrNull() == WILDCARD_EXPORT_NAME) {
                expandWildcardReexport(node, physicalFilePath, analysisRoot, ownNames)
            } else {
                listOf(node)
            }
        }
        return FileReport(nodes)
    }

    override fun selectImports(declaration: Declaration, imports: List<ImportDeclaration>): List<ImportDeclaration> {
        if (declaration.type != DeclarationType.REEXPORT) return imports
        if (declaration.name == WILDCARD_EXPORT_NAME) return imports
        // For named re-exports like `export { Foo } from 'module'`, TSE represents the
        // imported binding as the last segment of the import path. Only pass through
        // imports whose last path segment matches a name being re-exported.
        val reexportNames = setOf(declaration.name) + declaration.usedTypes.map { it.name }
        return imports.filter { it.path.isNotEmpty() && it.path.last() in reexportNames }
    }

    override fun extraDependencies(declaration: Declaration): Set<Dependency> {
        if (declaration.name != TSE_DEFAULT_EXPORT_NAME) return emptySet()
        return setOf(Dependency(path = physicalFilePath, isWildcard = true))
    }

    override fun convertImport(import: ImportDeclaration): Set<Dependency> {
        val resolvedPath = resolveImportPath(import.defaultImportPath())
        val primary = Dependency(path = Path(resolvedPath), isWildcard = import.isWildcard)
        if (import.isWildcard) unescapedSegmentsByPath[primary.path] = resolvedPath
        val index = buildIndexDependency(resolvedPath, import.isWildcard)
        return if (index != null) setOf(primary, index) else setOf(primary)
    }

    // Nodes here are synthetic — constructed from a secondary TSE parse of the source file,
    // not mapped from the current file's declarations. TseMappings extension functions are
    // not used because there is no ImportDeclaration/UsedType/DeclarationType to map from.
    private fun expandWildcardReexport(wildcardNode: Node, currentFilePath: Path, analysisRoot: File, ownNames: Set<String>): List<Node> {
        val wildcardDeps = wildcardNode.dependencies.filter { it.isWildcard }
        val sourceFiles = wildcardDeps
            .mapNotNull {
                resolveSourceFile(
                    unescapedSegmentsByPath[it.path] ?: it.path.parts,
                    analysisRoot
                )
            }.toSet()
        if (sourceFiles.isEmpty()) return listOf(wildcardNode)
        return sourceFiles.flatMap { sourceFile ->
            val sourceRelPath = toRelativePath(sourceFile, analysisRoot, stripExtension = true).parts
            val srcLanguage = if (sourceFile.name.endsWith(".$TSX_EXTENSION", ignoreCase = true)) Language.TSX else Language.TYPESCRIPT
            val sourceTseResult = TreeSitterDependencies.analyze(sourceFile.readText(), srcLanguage)
            sourceTseResult.declarations
                .filter { decl -> decl.name !in ownNames }
                .map { decl ->
                    Node(
                        pathWithName = currentFilePath + decl.name,
                        physicalPath = wildcardNode.physicalPath,
                        language = language,
                        nodeType = NodeType.REEXPORT,
                        dependencies = setOf(Dependency(path = Path(sourceRelPath + decl.name))),
                        usedTypes = setOf(Type.simple(decl.name))
                    )
                }
        }
    }

    private fun resolveSourceFile(pathParts: List<String>, analysisRoot: File): File? {
        val pathStr = pathParts.joinToString("/")
        for (suffix in SOURCE_FILE_SUFFIXES) {
            val file = File(analysisRoot, "$pathStr$suffix")
            if (file.exists()) return file
        }
        return null
    }

    private fun buildIndexDependency(resolvedPath: List<String>, isWildcard: Boolean): Dependency? {
        // A wildcard import with an empty resolved path has no module to point an
        // `index` barrel dependency at, so there is nothing to synthesize.
        if (isWildcard && resolvedPath.isEmpty()) return null
        if (isWildcard) return Dependency(Path(resolvedPath + "index"), isWildcard = true)
        if (resolvedPath.size < 2) return null
        return Dependency(Path(resolvedPath.dropLast(1) + listOf("index") + resolvedPath.takeLast(1)))
    }

    companion object {
        private const val TSX_EXTENSION = "tsx"
        private val SOURCE_FILE_SUFFIXES = listOf(".ts", ".tsx", ".mts", ".cts", "/index.ts", "/index.tsx", "/index.mts", "/index.cts")
    }
}
