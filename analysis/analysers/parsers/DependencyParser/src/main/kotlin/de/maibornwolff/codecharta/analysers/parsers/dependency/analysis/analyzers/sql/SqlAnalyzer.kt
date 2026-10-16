package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.sql

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toNodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies

/**
 * A table, view or routine is found by its name, whatever file creates it: SQL has no imports. An object lies in
 * the schema it is created in (`dbo.orders`) and a routine of a package in the package. A use naming the schema
 * finds the object of that schema; a use without one finds the object of the same schema first, then one created
 * without a schema, then one of any schema.
 */
class SqlAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    override fun analyze(): FileReport {
        val result = TreeSitterDependencies.analyze(fileInfo.content, Language.SQL)
        return FileReport(result.declarations.map { toNode(it) })
    }

    private fun toNode(declaration: Declaration): Node = Node(
        pathWithName = pathOf(declaration),
        physicalPath = fileInfo.physicalPath,
        nodeType = declaration.type.toNodeType(),
        language = SupportedLanguage.SQL,
        dependencies = setOf(ANY_SCHEMA_OR_PACKAGE),
        usedTypes = declaration.usedTypes.map { Type.simple(it.name) }.toSet()
    )

    // What a file runs outside any definition belongs to that file alone, so it stays under the file's path
    private fun pathOf(declaration: Declaration): Path {
        if (declaration.type != DeclarationType.SCRIPT) return Path(declaration.parentPath + declaration.name)
        val segments = fileInfo.physicalPath.substringBeforeLast(FILE_ENDING_SEPARATOR).split(PATH_SEPARATOR, WINDOWS_PATH_SEPARATOR)
        return Path(segments + (segments.last() + SCRIPT_SUFFIX))
    }

    companion object {
        // A routine of a package uses an object of no package by its bare name
        private val ANY_SCHEMA_OR_PACKAGE = Dependency(Path.empty(), isWildcard = true)
        private const val SCRIPT_SUFFIX = ".script"
        private const val FILE_ENDING_SEPARATOR = "."
        private const val PATH_SEPARATOR = "/"
        private const val WINDOWS_PATH_SEPARATOR = "\\"
    }
}
