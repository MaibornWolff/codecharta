package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_MODULE_SCRIPT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toNodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toTypeOfUsage
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.splitNameToParts
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.api.UsedType

/**
 * The declarations of a PHP file, each at the namespace of its block plus its name (the name alone in the global
 * namespace). The extractor has resolved every name as the compiler does, so the analyzer writes each use as its full
 * path, with the global path a function or constant falls back to, and [PhpNameRules] takes a path only as written.
 * Top-level code is the script leaf `<file>.script` at the file's own path (decision 8), which an include uses by the
 * path it names (decisions 2 and 3).
 */
class PhpAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    // The file's path below the analysis root without its ending
    private val filePath by lazy { splitNameToParts(fileInfo.physicalPath).let { it.dropLast(1) + it.last().removeSuffix(PHP_ENDING) } }

    override fun analyze(): FileReport {
        val result = TreeSitterDependencies.analyze(fileInfo.content, Language.PHP)
        return FileReport(result.declarations.map { toNode(it) })
    }

    private fun toNode(declaration: Declaration): Node {
        val path = if (declaration.type == DeclarationType.SCRIPT) scriptLeafOf(filePath) else declaration.parentPath + declaration.name
        return Node(
            pathWithName = Path(path),
            physicalPath = fileInfo.physicalPath,
            language = fileInfo.language,
            nodeType = declaration.type.toNodeType(),
            dependencies = emptySet(),
            usedTypes = declaration.usedTypes.mapNotNull { typeOf(it) }.toSet()
        )
    }

    private fun typeOf(use: UsedType): Type? {
        val path = if (use.name == TSE_MODULE_SCRIPT_NAME) includedScriptOf(use.namespacePrefix) else use.namespacePrefix + use.name
        path ?: return null
        return Type.simple(Path(path).withDots(), use.usage.toTypeOfUsage()).copy(fallbacks = use.fallbacks.mapNotNull { typeOf(it) })
    }

    // An include path relative to the including file's folder, or from the analysis root when it starts with a slash
    private fun includedScriptOf(includePath: List<String>): List<String>? {
        val isAbsolute = includePath.firstOrNull() == ""
        val segments = (if (isAbsolute) emptyList() else filePath.dropLast(1)).toMutableList()
        for (segment in includePath.filter { it.isNotEmpty() && it != CURRENT_FOLDER }) {
            if (segment != PARENT_FOLDER) {
                segments.add(segment)
            } else if (segments.isEmpty()) {
                return null
            } else {
                segments.removeLast()
            }
        }
        if (segments.isEmpty()) return null
        return scriptLeafOf(segments.dropLast(1) + segments.last().removeSuffix(PHP_ENDING))
    }

    private fun scriptLeafOf(filePath: List<String>): List<String> = filePath + (filePath.last() + SCRIPT_SUFFIX)

    companion object {
        private const val PHP_ENDING = ".php"
        private const val SCRIPT_SUFFIX = ".script"
        private const val CURRENT_FOLDER = "."
        private const val PARENT_FOLDER = ".."
    }
}
