package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.accesslayout

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.sql.SqlLookup
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.sql.SqlProject
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vba.VbaAccessQueryUses
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vba.VbaLayoutFiles
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
import de.maibornwolff.treesitter.excavationsite.api.AccessQuery
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies

/**
 * The layout of an Access form or report (`docs/name-resolution/vba.md`, Access forms and reports): one leaf named after
 * its file. It uses the queries of its sources, its subforms and subreports and what its expressions name, looked up as
 * its code module looks names up, so a routine of that module means the module; it uses the module also when it binds
 * an event procedure. The SQL of a source names what an Access query names.
 */
class AccessLayoutAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    private val vbaProject by lazy {
        fileInfo.analysisRoot?.let { VbaProject.of(it, fileInfo.analysedFiles) }
            ?: VbaProject.ofSingleFile(fileInfo.physicalPath, fileInfo.content)
    }

    override fun analyze(): FileReport {
        val layout = TreeSitterDependencies.accessLayout(fileInfo.content)
        val codeModule = vbaProject.codeModuleOfLayout(fileInfo.physicalPath)
        val lookup = VbaLookup(vbaProject, codeModule, FilePath(splitNameToParts(fileInfo.physicalPath)))
        val leaf = VbaLayoutFiles.leafOf(fileInfo.physicalPath)
        val eventModule = codeModule?.takeIf { layout.bindsEventProcedure }?.let { listOf(it.name) }
        val uses = layout.names.mapNotNull { lookup.resolve(it) } + listOfNotNull(eventModule) + layout.queries.flatMap { usesOf(it) }
        val node = Node(
            pathWithName = Path(leaf),
            physicalPath = fileInfo.physicalPath,
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.ACCESS_LAYOUT,
            dependencies = emptySet(),
            usedTypes = uses.filter { it != leaf }.distinct().map { Type.simple(Path(it).withDots()) }.toSet()
        )
        return FileReport(listOf(node))
    }

    // Without a root the run holds no query, and no VBA function an Access query could call
    private fun usesOf(query: AccessQuery): List<List<String>> {
        val root = fileInfo.analysisRoot ?: return emptyList()
        val sqlLookup = SqlLookup(SqlProject.of(root, fileInfo.analysedFiles), null, null)
        val inSql = query.names.mapNotNull { sqlLookup.resolve(it)?.path }
        return inSql + VbaAccessQueryUses.of(fileInfo).of(query) { sqlLookup.resolve(it) == null }
    }
}
