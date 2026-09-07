package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.model.RelativeImport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.resolveRelativePath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toDependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toNodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.splitNameToParts
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.ImportKind
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.api.UsedType

class CppAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    override fun analyze(): FileReport {
        val result = TreeSitterDependencies.analyze(fileInfo.content, Language.CPP)
        val physicalPath = Path.fromPhysicalPath(fileInfo.physicalPath)
        val physicalPathParts = splitNameToParts(fileInfo.physicalPath).filter { it != "." }
        val importsByNamespace = result.imports
            .groupBy { it.namespacePath }
            .mapValues { (_, imports) -> imports.map { it.normalize(physicalPath) } }
        val globalImports = importsByNamespace[emptyList()].orEmpty()

        val nodes = result.declarations.map { declaration ->
            toNode(declaration, globalImports, importsByNamespace, physicalPathParts)
        }
        return FileReport(nodes)
    }

    private fun toNode(
        declaration: Declaration,
        globalImports: List<Dependency>,
        importsByNamespace: Map<List<String>, List<Dependency>>,
        physicalPathParts: List<String>
    ): Node = Node(
        pathWithName = buildPathWithName(declaration, physicalPathParts),
        physicalPath = fileInfo.physicalPath,
        language = SupportedLanguage.CPP,
        nodeType = declaration.type.toNodeType(),
        dependencies = buildDependencies(declaration, globalImports, importsByNamespace),
        usedTypes = declaration.usedTypes.map { it.toType() }.toSet()
    )

    private fun buildPathWithName(declaration: Declaration, physicalPathParts: List<String>): Path = if (declaration.parentPath.isEmpty()) {
        Path(physicalPathParts + declaration.name)
    } else {
        Path(declaration.parentPath + declaration.name)
    }

    private fun buildDependencies(
        declaration: Declaration,
        globalImports: List<Dependency>,
        importsByNamespace: Map<List<String>, List<Dependency>>
    ): Set<Dependency> {
        val scopedImports = importsByNamespace[declaration.parentPath].orEmpty()
        val selfWildcard = Dependency.asWildcard(declaration.parentPath)
        val namespacePrefixWildcards = declaration.usedTypes
            .flatMap { it.collectNamespacePrefixes() }
            .map { Dependency.asWildcard(it) }
        return (globalImports + scopedImports + selfWildcard + namespacePrefixWildcards).toSet()
    }

    private fun UsedType.collectNamespacePrefixes(): List<List<String>> {
        val own = if (namespacePrefix.isEmpty()) emptyList() else listOf(namespacePrefix)
        return own + genericTypes.flatMap { it.collectNamespacePrefixes() }
    }

    private fun ImportDeclaration.normalize(physicalPath: Path): Dependency {
        if (kind != ImportKind.INCLUDE) return toDependency()
        val firstSegment = path.firstOrNull()
        val resolved = if (firstSegment == "." || firstSegment == "..") {
            resolveRelativePath(RelativeImport(path.joinToString("/")), physicalPath)
        } else {
            Path(path)
        }
        val transformedFilename = resolved.parts.last().replace(".", "_")
        return Dependency(Path(resolved.parts.dropLast(1) + transformedFilename), isWildcard = false)
    }
}
