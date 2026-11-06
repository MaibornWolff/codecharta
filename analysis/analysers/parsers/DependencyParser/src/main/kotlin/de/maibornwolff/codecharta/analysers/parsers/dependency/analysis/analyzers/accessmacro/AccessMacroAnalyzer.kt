package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.accessmacro

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vba.AccessObjectFiles
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vba.VbaLookup
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vba.VbaProject
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.splitNameToParts
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies

/**
 * A stand-alone Access macro (`docs/name-resolution/vba.md`, Access macros): one leaf named after its file, its
 * submacros a part of it. It uses the forms, reports, queries and macros its actions name and what its expressions
 * name, looked up as an Access query looks names up, without a module of its own.
 */
class AccessMacroAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    private val vbaProject by lazy {
        fileInfo.analysisRoot?.let { VbaProject.of(it, fileInfo.analysedFiles) }
            ?: VbaProject.ofSingleFile(fileInfo.physicalPath, fileInfo.content)
    }

    override fun analyze(): FileReport {
        val macro = TreeSitterDependencies.accessMacro(fileInfo.content)
        val lookup = VbaLookup(vbaProject, null, FilePath(splitNameToParts(fileInfo.physicalPath)))
        val leaf = AccessObjectFiles.leafOf(fileInfo.physicalPath)
        val uses = macro.names.mapNotNull { lookup.resolve(it) }
        val node = Node(
            pathWithName = Path(leaf),
            physicalPath = fileInfo.physicalPath,
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.ACCESS_MACRO,
            dependencies = emptySet(),
            usedTypes = uses.filter { it != leaf }.distinct().map { Type.simple(Path(it).withDots()) }.toSet()
        )
        return FileReport(listOf(node))
    }
}
