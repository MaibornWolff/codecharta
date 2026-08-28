package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output

import com.google.gson.JsonArray
import com.google.gson.JsonObject
import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeFilter
import de.maibornwolff.codecharta.model.LensSet
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
                .withOpaqueLenses(mapOf(LensSet.DOMAIN_KEY to buildDomainLens(result)))
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

    private fun buildDomainLens(result: DomainAnalysisResult): JsonObject {
        val domainLens = JsonObject()
        domainLens.add(NODES_KEY, buildDomainNodes(result))
        return domainLens
    }

    private fun buildDomainNodes(result: DomainAnalysisResult): JsonObject {
        val fileKeys = result.filePaths.toSet()
        val domainNodes = JsonObject()

        result.wordsByPath.entries
            .map { (path, words) ->
                val segments = segmentsOf(path)
                val type = if (path in fileKeys) NodeType.File else NodeType.Folder
                DomainNode(NodeId.fromSegments(segments, type), segments, words)
            }.sortedWith(compareBy({ it.segments.size }, { it.segments.joinToString(SEGMENT_SEPARATOR) }))
            .forEach { node -> domainNodes.add(node.id, toDomainNodeObject(node.words)) }

        return domainNodes
    }

    private fun toDomainNodeObject(words: List<WordFrequency>): JsonObject {
        val domainNode = JsonObject()
        domainNode.add(WORDS_KEY, toWordArray(words))
        return domainNode
    }

    private fun toWordArray(words: List<WordFrequency>): JsonArray {
        val array = JsonArray()
        words.forEach { word ->
            val wordObject = JsonObject()
            wordObject.addProperty(TEXT_KEY, word.text)
            wordObject.addProperty(FREQUENCY_KEY, word.frequency)
            if (word.tfidf != null) {
                wordObject.addProperty(TFIDF_KEY, word.tfidf)
            }
            array.add(wordObject)
        }
        return array
    }

    private fun segmentsOf(path: String): List<String> = PathFactory.extractOSIndependentPath(path).edgesList

    private data class DomainNode(val id: String, val segments: List<String>, val words: List<WordFrequency>)

    companion object {
        private const val SEGMENT_SEPARATOR = "/"

        private const val NODES_KEY = "nodes"
        private const val WORDS_KEY = "words"
        private const val TEXT_KEY = "text"
        private const val FREQUENCY_KEY = "frequency"
        private const val TFIDF_KEY = "tfidf"
    }
}
