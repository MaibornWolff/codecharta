package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.model.toImport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.resolveRelativePath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toNodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.ImportKind
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies

class PhpAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    override fun analyze(): FileReport {
        val result = TreeSitterDependencies.analyze(fileInfo.content, Language.PHP)
        val declaredNamespace = result.packagePath.takeIf { it.isNotEmpty() }?.let { Path(it) }
        val namespace = declaredNamespace ?: fileInfo.physicalPathAsPath()
        val pathOfFile = pathOfFile(declaredNamespace)
        val imports = result.imports.map { toDependency(it, pathOfFile) }
        val dependencies = imports.toSet() + Dependency(path = namespace, isWildcard = true)
        val nodes = result.declarations.map { declaration ->
            Node(
                pathWithName = namespace + nameOf(declaration),
                physicalPath = fileInfo.physicalPath,
                language = fileInfo.language,
                nodeType = declaration.type.toNodeType(),
                dependencies = dependencies,
                usedTypes = declaration.usedTypes.map { it.toType() }.toSet()
            )
        }
        return FileReport(nodes)
    }

    // An include is resolved as if the file lay in the directory its namespace names
    private fun pathOfFile(declaredNamespace: Path?): Path {
        if (declaredNamespace == null) return Path(physicalPathSegments())
        return Path(declaredNamespace.parts + fileNameWithoutEnding())
    }

    private fun toDependency(import: ImportDeclaration, pathOfFile: Path): Dependency {
        if (import.kind != ImportKind.INCLUDE) return Dependency(Path(import.path))
        val includedFile = import.path.joinToString(PATH_SEPARATOR).trimFileEnding()
        return Dependency(resolveRelativePath(includedFile.toImport(), pathOfFile))
    }

    private fun nameOf(declaration: Declaration): String =
        if (declaration.type == DeclarationType.SCRIPT) fileNameWithoutEnding() + SCRIPT_SUFFIX else declaration.name

    private fun fileNameWithoutEnding(): String = physicalPathSegments().last()

    private fun physicalPathSegments(): List<String> = fileInfo.physicalPath.trimFileEnding().split(PATH_SEPARATOR, WINDOWS_PATH_SEPARATOR)

    private fun String.trimFileEnding(): String = removeSuffix(PHP_ENDING)

    companion object {
        private const val PHP_ENDING = ".php"
        private const val SCRIPT_SUFFIX = ".script"
        private const val PATH_SEPARATOR = "/"
        private const val WINDOWS_PATH_SEPARATOR = "\\"
    }
}
