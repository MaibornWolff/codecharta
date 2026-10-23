package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.withoutFileSuffix
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toNodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.api.UsedType

/**
 * The declarations of a Python file. The extractor reports a use as the module its name is looked up in and the name
 * with the attribute names behind it; the analyzer writes it as the paths it can have below the analysis root, the
 * likeliest first, of which [PythonNameRules] takes the first that is a declaration.
 */
class PythonAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    private val modulePath by lazy { fileInfo.physicalPathAsPath().withoutFileSuffix(PYTHON_SUFFIX).parts }
    private val modules = fileInfo.analysisRoot?.let { PythonModules.of(it) }

    override fun analyze(): FileReport {
        val result = TreeSitterDependencies.analyze(fileInfo.content, Language.PYTHON)
        val candidates = ModuleCandidates(modules, modulePath.dropLast(1))
        val reexports = if (modulePath.last() == PythonModules.PACKAGE_FILE) reexportsOf(result.imports, candidates) else emptyList()
        return FileReport(reexports + result.declarations.map { toNode(it, candidates) })
    }

    // A package file that imports a name makes it importable from the package itself
    private fun reexportsOf(imports: List<ImportDeclaration>, candidates: ModuleCandidates): List<Node> =
        PythonImports.reexportsOf(imports, modulePath).map { (name, imported) ->
            node(listOf(name), NodeType.UNKNOWN, setOfNotNull(typeOf(candidates.namesIn(imported.module, listOf(imported.name)))))
        }

    private fun toNode(declaration: Declaration, candidates: ModuleCandidates): Node {
        if (declaration.type == DeclarationType.VARIABLE) return node(listOf(declaration.name), NodeType.VARIABLE, emptySet())
        val usedTypes = declaration.usedTypes.mapNotNull { use ->
            typeOf((listOf(use) + use.fallbacks).flatMap { pathsOf(it, candidates) })
        }
        return node(declaration.parentPath + declaration.name, declaration.type.toNodeType(), usedTypes.toSet())
    }

    private fun pathsOf(use: UsedType, candidates: ModuleCandidates): List<List<String>> {
        val chain = use.name.split(SEGMENT_SEPARATOR)
        if (use.namespacePrefix.isEmpty()) return ModuleCandidates.deepestFirst(modulePath, chain)
        val module = ModuleReference.of(use.namespacePrefix, modulePath) ?: return emptyList()
        return candidates.namesIn(module, chain)
    }

    // The first of the paths that is a declaration
    private fun typeOf(paths: List<List<String>>): Type? {
        val dottedPaths = paths.distinct().map { it.joinToString(SEGMENT_SEPARATOR) }
        val first = dottedPaths.firstOrNull() ?: return null
        return Type.simple(first).copy(fallbacks = dottedPaths.drop(1).map { Type.simple(it) })
    }

    private fun node(nameBelowModule: List<String>, nodeType: NodeType, usedTypes: Set<Type>) = Node(
        pathWithName = Path(modulePath + nameBelowModule),
        physicalPath = fileInfo.physicalPath,
        language = fileInfo.language,
        nodeType = nodeType,
        dependencies = emptySet(),
        usedTypes = usedTypes
    )

    companion object {
        private const val PYTHON_SUFFIX = "py"
        private const val SEGMENT_SEPARATOR = "."
    }
}
