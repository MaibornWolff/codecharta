package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_ALIAS_SEGMENT
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_FORWARD_DECLARATION_SEGMENT
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toNodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toTypeOfUsage
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.splitNameToParts
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.api.UsedType

/**
 * The declarations of a C or C++ file, each use written as the exact path of the declaration `docs/name-resolution/cpp.md`
 * finds for it in the include closure of the file; a use that means nothing the closure declares is left out.
 */
class CppAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    private val file = splitNameToParts(fileInfo.physicalPath).filter { it != CURRENT_FOLDER }

    override fun analyze(): FileReport {
        val result = TreeSitterDependencies.analyze(fileInfo.content, Language.CPP)
        val project = fileInfo.analysisRoot?.let { CppDeclarations.of(it) }
        val names = project?.visibleNamesOf(file) ?: CppVisibleNames(listOf(CppFileFacts.of(result)))
        val targets = CppTargets(file, project, result)
        val nodes = result.declarations.filterNot { it.isForwardDeclaration() || it.isAlias() }.map { declaration ->
            toNode(declaration, names, targets)
        }
        return FileReport(nodes)
    }

    private fun toNode(declaration: Declaration, names: CppVisibleNames, targets: CppTargets): Node {
        val scope = declaration.parentPath + declaration.name
        return Node(
            pathWithName = Path(targets.ownPathOf(scope)),
            physicalPath = fileInfo.physicalPath,
            language = SupportedLanguage.CPP,
            nodeType = declaration.type.toNodeType(),
            dependencies = emptySet(),
            usedTypes = declaration.usedTypes.flatMap { resolve(it, scope, names, targets) }.toSet()
        )
    }

    // A use that means nothing visible still holds its template arguments, which are uses of their own
    private fun resolve(used: UsedType, scope: List<String>, names: CppVisibleNames, targets: CppTargets): List<Type> {
        val genericTypes = used.genericTypes.flatMap { resolve(it, scope, names, targets) }
        val target = names.resolve(used.namespacePrefix + used.name, scope)?.let { targets.targetPathOf(it) }
            ?: return genericTypes
        return listOf(Type.generic(Path(target).withDots(), genericTypes, used.usage.toTypeOfUsage()))
    }

    private fun Declaration.isForwardDeclaration(): Boolean = parentPath.firstOrNull() == TSE_FORWARD_DECLARATION_SEGMENT

    private fun Declaration.isAlias(): Boolean = parentPath.firstOrNull() == TSE_ALIAS_SEGMENT

    companion object {
        private const val CURRENT_FOLDER = "."
    }
}
