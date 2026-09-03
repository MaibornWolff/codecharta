package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output

import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeFilter
import de.maibornwolff.codecharta.model.DomainLens
import de.maibornwolff.codecharta.model.DomainNode
import de.maibornwolff.codecharta.model.DomainWord
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder

class DomainProjectGenerator(private val projectBuilder: ProjectBuilder = ProjectBuilder()) {
    fun generate(result: DomainAnalysisResult, pipedProject: Project? = null): Project {
        addFilesAsNodes(result.filePaths)
        val project =
            projectBuilder
                .withDomainLens(buildDomainLens(result))
                .build()

        return if (pipedProject != null) MergeFilter.mergePipedWithCurrentProject(pipedProject, project) else project
    }

    private fun addFilesAsNodes(filePaths: List<String>) {
        filePaths.forEach { filePath ->
            val segments = segmentsOf(filePath)
            if (segments.isEmpty()) return@forEach
            val fileName = segments.last()
            val parentPath = Path(segments.dropLast(1))
            projectBuilder.insertByPath(parentPath, MutableNode(fileName, NodeType.File))
        }
    }

    private fun buildDomainLens(result: DomainAnalysisResult): DomainLens {
        val fileKeys = result.filePaths.toSet()
        val nodes = LinkedHashMap<String, DomainNode>()

        result.wordsByPath.entries
            .map { (path, words) ->
                val segments = segmentsOf(path)
                val type = if (path in fileKeys) NodeType.File else NodeType.Folder
                NodeEntry(NodeId.fromSegments(segments, type), segments, words)
            }.sortedWith(compareBy({ it.segments.size }, { it.segments.joinToString(SEGMENT_SEPARATOR) }))
            .forEach { entry -> nodes[entry.id] = DomainNode(entry.words.map(::toDomainWord)) }

        return DomainLens(nodes)
    }

    private fun toDomainWord(word: WordFrequency): DomainWord = DomainWord(word.text, word.frequency, word.tfidf)

    private fun segmentsOf(path: String): List<String> = PathFactory.extractOSIndependentPath(path).edgesList

    private data class NodeEntry(val id: String, val segments: List<String>, val words: List<WordFrequency>)

    companion object {
        private const val SEGMENT_SEPARATOR = "/"
    }
}
