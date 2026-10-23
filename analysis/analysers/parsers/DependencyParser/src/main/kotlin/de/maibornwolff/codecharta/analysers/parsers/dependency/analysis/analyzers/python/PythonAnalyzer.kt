package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.withoutFileSuffix
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toNodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.api.UsedType

class PythonAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    private val modulePath by lazy { fileInfo.physicalPathAsPath().withoutFileSuffix(PYTHON_SUFFIX).parts }
    private val modules = fileInfo.analysisRoot?.let { PythonModules.of(it) }

    override fun analyze(): FileReport {
        val result = TreeSitterDependencies.analyze(fileInfo.content, Language.PYTHON)
        val imports = PythonImports.of(result.imports, modulePath, modules)
        val reexports = if (modulePath.last() == PythonModules.PACKAGE_FILE) namesReexportedByPackage(imports) else emptyList()
        return FileReport(reexports + result.declarations.map { toNode(it, imports) })
    }

    // A package file that imports a name makes it importable from the package itself
    private fun namesReexportedByPackage(imports: PythonImports): List<Node> = imports.reexportedNames.map { name ->
        node(listOf(name), NodeType.UNKNOWN, imports.memberDependencies.toSet(), setOf(Type.simple(name)))
    }

    private fun toNode(declaration: Declaration, imports: PythonImports): Node {
        if (declaration.type == DeclarationType.VARIABLE) return node(listOf(declaration.name), NodeType.VARIABLE, emptySet(), emptySet())
        val (qualifiedNames, plainNames) = declaration.usedTypes.partition { it.namespacePrefix.isNotEmpty() }
        val aliasedMembersInUse = plainNames.mapNotNull { imports.aliasedMembers[it.name] }
        val dependencies = imports.memberDependencies + imports.wildcardDependencies +
            aliasedMembersInUse.flatMap { imports.dependenciesOn(it.module, it.name) } +
            qualifiedNames.flatMap { dependenciesOnImportedModule(it, imports) }
        val usedTypes = plainNames.map { Type.simple(imports.aliasedMembers[it.name]?.name?.last() ?: it.name) } +
            qualifiedNames.mapNotNull { typeBehindImportedModule(it, imports) }
        return node(declaration.parentPath + declaration.name, declaration.type.toNodeType(), dependencies.toSet(), usedTypes.toSet())
    }

    // A name behind a module an import binds means exactly that module's name, or its package's
    private fun typeBehindImportedModule(qualifiedName: UsedType, imports: PythonImports): Type? {
        val module = imports.moduleBoundTo(qualifiedName.namespacePrefix.joinToString(SEGMENT_SEPARATOR)) ?: return null
        val paths = imports.pathsIn(module, listOf(qualifiedName.name)).map { it.joinToString(SEGMENT_SEPARATOR) }
        return Type.simple(paths.first()).copy(fallbacks = paths.drop(1).map { Type.simple(it) })
    }

    private fun dependenciesOnImportedModule(qualifiedName: UsedType, imports: PythonImports): List<Dependency> {
        val module = imports.moduleImportedAs(qualifiedName.namespacePrefix.joinToString(SEGMENT_SEPARATOR)) ?: return emptyList()
        return imports.pathsIn(module, listOf(qualifiedName.name)).map { Dependency(Path(it)) }
    }

    private fun node(nameBelowModule: List<String>, nodeType: NodeType, dependencies: Set<Dependency>, usedTypes: Set<Type>) = Node(
        pathWithName = Path(modulePath + nameBelowModule),
        physicalPath = fileInfo.physicalPath,
        language = fileInfo.language,
        nodeType = nodeType,
        dependencies = dependencies,
        usedTypes = usedTypes
    )

    companion object {
        private const val PYTHON_SUFFIX = "py"
        private const val SEGMENT_SEPARATOR = "."
    }
}
