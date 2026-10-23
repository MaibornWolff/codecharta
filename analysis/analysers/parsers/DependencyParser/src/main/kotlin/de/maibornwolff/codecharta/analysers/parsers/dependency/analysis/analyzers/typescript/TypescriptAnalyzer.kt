package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.BaseLanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_AMBIENT_MODULE_SEGMENT
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_DEFAULT_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.WILDCARD_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.withoutFileSuffix
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.defaultImportPath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.AngularMetadata
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.AngularDeclaration
import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.EmbeddedDeclarations
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.ImportKind
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.UsedType
import java.io.File

class TypescriptAnalyzer(fileInfo: FileInfo) : BaseLanguageAnalyzer(fileInfo) {
    override val language = SupportedLanguage.TYPESCRIPT

    // The extension is taken from the file as spelled, so `.mts`, `.cts` and `Foo.TSX` strip cleanly.
    private val extension = fileInfo.physicalPath.substringAfterLast('.', "").lowercase()
    private val isTsx = extension == "tsx"
    private val physicalFilePath by lazy { fileInfo.physicalPathAsPath().withoutFileSuffix(extension) }

    // The modules `export * from` names, whose named exports this module re-exports
    private val starSources = LinkedHashSet<File>()
    private val memberImports = fileInfo.analysisRoot?.let { MemberImports(it) }
    private val qualifiedNames by lazy { QualifiedNames(physicalFilePath) }

    override fun tseLanguage(): Language = if (isTsx) Language.TSX else Language.TYPESCRIPT

    override fun buildPathWithName(packagePath: List<String>, declaration: Declaration): Path {
        if (declaration.parentPath.firstOrNull() == TSE_AMBIENT_MODULE_SEGMENT) {
            return Path(declaration.parentPath.drop(1)) + declaration.name
        }
        if (declaration.parentPath.isNotEmpty()) return physicalFilePath + Path(declaration.parentPath) + declaration.name
        if (declaration.name == TSE_DEFAULT_EXPORT_NAME) return physicalFilePath + DefaultExports.LEAF_NAME
        return physicalFilePath + declaration.name
    }

    override fun analyze(): FileReport {
        val declaredNodes = super.analyze().nodes.let { memberImports?.rewrite(it) ?: it }
        val baseReport = FileReport(qualifiedNames.resolvedIn(DefaultExports.withoutOwnNames(declaredNodes)))
        val analysisRoot = fileInfo.analysisRoot ?: return baseReport
        val ownNames = baseReport.nodes
            .filter { it.pathWithName.parts.lastOrNull() != WILDCARD_EXPORT_NAME }
            .mapNotNull { it.pathWithName.parts.lastOrNull() }
            .toSet()
        val nodes = baseReport.nodes.flatMap { node ->
            if (node.pathWithName.parts.lastOrNull() == WILDCARD_EXPORT_NAME) {
                expandStarExports(node, analysisRoot, ownNames)
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

    override fun selectUsedTypes(declaration: Declaration, imports: List<ImportDeclaration>): Set<UsedType> {
        qualifiedNames.remember(declaration.usedTypes)
        return withEnclosingNamespacesWrittenInFull(declaration, declaration.usedTypes)
    }

    // A member of a namespace that names a namespace around it means that namespace of the own file
    private fun withEnclosingNamespacesWrittenInFull(declaration: Declaration, usedTypes: Set<UsedType>): Set<UsedType> {
        val namespacePath = declaration.parentPath.takeUnless { it.firstOrNull() == TSE_AMBIENT_MODULE_SEGMENT }.orEmpty()
        if (namespacePath.isEmpty()) return usedTypes
        return usedTypes.mapTo(LinkedHashSet()) { usedType ->
            val depth = namespacePath.lastIndexOf(usedType.name)
            if (depth < 0) usedType else usedType.copy(name = (physicalFilePath + Path(namespacePath.take(depth + 1))).withDots())
        }
    }

    override fun nodesOf(declaration: Declaration, node: Node, embedded: List<EmbeddedDeclarations>): List<Node> {
        val angular = declaration.angular ?: return listOf(node)
        val inlineTemplates = embedded.filter { it.language == Language.ANGULAR }
        val templatePath = if (inlineTemplates.isEmpty()) templateFilePathOf(angular) else inlineTemplatePath(node.pathWithName)
        // A component uses its template, which resolves by the full path of the template's node
        val usedTemplate = templatePath?.let { UsedType(it.withDots()).toType() }
        val component = node.copy(angular = AngularMetadata(angular, templatePath), usedTypes = node.usedTypes + setOfNotNull(usedTemplate))
        return listOf(component) + inlineTemplates.map { inlineTemplateNode(it.declarations, component) }
    }

    private fun templateFilePathOf(angular: AngularDeclaration): Path? = angular.templateUrl?.let {
        templateFilePath(it, fileInfo.physicalPath)
    }

    override fun convertImport(import: ImportDeclaration): Set<Dependency> {
        val analysisRoot = fileInfo.analysisRoot ?: return dependenciesByWrittenPath(import)
        val moduleFile = ImportedModules.fileOf(import, fileInfo) ?: return dependenciesByWrittenPath(import)
        val module = ImportedModules.logicalPathOf(moduleFile, analysisRoot)
        if (import.isWildcard && import.kind == ImportKind.REEXPORT) starSources.add(moduleFile)
        memberImports?.targetOf(import, moduleFile, module)?.let { return setOf(Dependency(path = it)) }
        val importedName = if (ImportedModules.namesMember(import)) listOf(import.defaultImportPath().last()) else emptyList()
        return setOf(Dependency(path = Path(module.parts + importedName), isWildcard = import.isWildcard))
    }

    // A module the specifier names no project file of keeps the path as written, for the library or file it may mean
    private fun dependenciesByWrittenPath(import: ImportDeclaration): Set<Dependency> {
        val resolvedPath = resolveImportPath(import.defaultImportPath())
        val primary = Dependency(path = Path(resolvedPath), isWildcard = import.isWildcard)
        val index = buildIndexDependency(resolvedPath, import.isWildcard)
        return if (index != null) setOf(primary, index) else setOf(primary)
    }

    // One re-export leaf per name `export *` re-exports, pointing at the declaration that name means in its module
    private fun expandStarExports(wildcardNode: Node, analysisRoot: File, ownNames: Set<String>): List<Node> {
        if (starSources.isEmpty()) return listOf(wildcardNode)
        val exports = ModuleExports.of(analysisRoot)
        return exports.starExports(starSources.toList(), ownNames).map { (name, source) ->
            val target = ImportedModules.logicalPathOf(source, analysisRoot) + exports.nameOf(source, name)
            Node(
                pathWithName = physicalFilePath + name,
                physicalPath = wildcardNode.physicalPath,
                language = language,
                nodeType = NodeType.REEXPORT,
                dependencies = setOf(Dependency(path = target)),
                usedTypes = setOf(Type.simple(target.withDots()))
            )
        }
    }

    private fun buildIndexDependency(resolvedPath: List<String>, isWildcard: Boolean): Dependency? {
        // A wildcard import with an empty resolved path has no module to point an
        // `index` barrel dependency at, so there is nothing to synthesize.
        if (isWildcard && resolvedPath.isEmpty()) return null
        if (isWildcard) return Dependency(Path(resolvedPath + "index"), isWildcard = true)
        if (resolvedPath.size < 2) return null
        return Dependency(Path(resolvedPath.dropLast(1) + listOf("index") + resolvedPath.takeLast(1)))
    }
}
