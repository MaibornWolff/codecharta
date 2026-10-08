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

    override fun analyze(): FileReport {
        val result = TreeSitterDependencies.analyze(fileInfo.content, Language.PYTHON)
        val imports = PythonImports.of(result.imports, modulePath)
        val reexports = if (modulePath.last() == PythonImports.PACKAGE_FILE) namesReexportedByPackage(imports) else emptyList()
        return FileReport(reexports + result.declarations.map { toNode(it, imports) })
    }

    // A package file that imports a name makes it importable from the package itself
    private fun namesReexportedByPackage(imports: PythonImports): List<Node> = imports.memberDependencies
        .filter { PythonImports.PACKAGE_FILE !in it.path.parts }
        .map { dependency ->
            val name = dependency.path.parts.last()
            node(name, NodeType.UNKNOWN, imports.memberDependencies.toSet(), setOf(Type.simple(name)))
        }

    private fun toNode(declaration: Declaration, imports: PythonImports): Node {
        if (declaration.type == DeclarationType.VARIABLE) return node(declaration.name, NodeType.VARIABLE, emptySet(), emptySet())
        val (qualifiedNames, plainNames) = declaration.usedTypes.partition { it.namespacePrefix.isNotEmpty() }
        val aliasedMembersInUse = plainNames.mapNotNull { imports.aliasedMembers[it.name] }
        val dependencies = imports.memberDependencies + imports.wildcardDependencies +
            aliasedMembersInUse.flatMap { PythonImports.inModuleOrPackage(it.dropLast(1), listOf(it.last())) } +
            qualifiedNames.flatMap { dependenciesOnImportedModule(it, imports) }
        val usedTypes = plainNames.map { Type.simple(imports.aliasedMembers[it.name]?.last() ?: it.name) }
        return node(declaration.name, declaration.type.toNodeType(), dependencies.toSet(), usedTypes.toSet())
    }

    private fun dependenciesOnImportedModule(qualifiedName: UsedType, imports: PythonImports): List<Dependency> {
        val qualifier = qualifiedName.namespacePrefix
        val dottedQualifier = qualifier.joinToString(SEGMENT_SEPARATOR)
        val module = if (dottedQualifier in imports.modules) qualifier else imports.aliasedModules[dottedQualifier]
        return module?.let { PythonImports.inModuleOrPackage(it, listOf(qualifiedName.name)) }.orEmpty()
    }

    private fun node(name: String, nodeType: NodeType, dependencies: Set<Dependency>, usedTypes: Set<Type>) = Node(
        pathWithName = Path(modulePath + name),
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
