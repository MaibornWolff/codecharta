package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toNodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toTypeOfUsage
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
 */
class PhpAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    override fun analyze(): FileReport {
        val result = TreeSitterDependencies.analyze(fileInfo.content, Language.PHP)
        val scriptNamespace = result.packagePath.takeIf { it.isNotEmpty() }?.let { Path(it) } ?: fileInfo.physicalPathAsPath()
        return FileReport(result.declarations.map { toNode(it, scriptNamespace) })
    }

    private fun toNode(declaration: Declaration, scriptNamespace: Path): Node {
        val path = if (declaration.type == DeclarationType.SCRIPT) {
            scriptNamespace + (fileNameWithoutEnding() + SCRIPT_SUFFIX)
        } else {
            Path(declaration.parentPath + declaration.name)
        }
        return Node(
            pathWithName = path,
            physicalPath = fileInfo.physicalPath,
            language = fileInfo.language,
            nodeType = declaration.type.toNodeType(),
            dependencies = emptySet(),
            usedTypes = declaration.usedTypes.map { typeOf(it) }.toSet()
        )
    }

    private fun typeOf(use: UsedType): Type = Type
        .simple(Path(use.namespacePrefix + use.name).withDots(), use.usage.toTypeOfUsage())
        .copy(fallbacks = use.fallbacks.map { typeOf(it) })

    private fun fileNameWithoutEnding(): String =
        fileInfo.physicalPath.split(PATH_SEPARATOR, WINDOWS_PATH_SEPARATOR).last().removeSuffix(PHP_ENDING)

    companion object {
        private const val PHP_ENDING = ".php"
        private const val SCRIPT_SUFFIX = ".script"
        private const val PATH_SEPARATOR = "/"
        private const val WINDOWS_PATH_SEPARATOR = "\\"
    }
}
