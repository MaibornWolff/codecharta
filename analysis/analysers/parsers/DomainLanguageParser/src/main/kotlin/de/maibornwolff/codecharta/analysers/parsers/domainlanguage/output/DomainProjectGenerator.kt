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

/**
 * Builds a cc.json 2.0 [Project] from a [DomainAnalysisResult]: a standard `files` tree plus the
 * reserved opaque `domain` lens (`LensSet.DOMAIN_KEY`).
 *
 * The lens is a bare `{ "<nodeId>": [{text, frequency, tfidf?}, ...] }` map — no envelope. Each key is
 * a cc.json 2.0 node id computed with [NodeId.fromSegments] using the SAME path segments and
 * [NodeType] the 2.0 writer derives for the files tree, so the lens resolves against the emitted ids
 * (File for leaves, Folder for directories and the root).
 */
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
        val fileKeys = result.filePaths.toSet()
        val domainLens = JsonObject()

        result.wordsByPath.entries
            .map { (path, words) ->
                val segments = segmentsOf(path)
                val type = if (path in fileKeys) NodeType.File else NodeType.Folder
                DomainNode(NodeId.fromSegments(segments, type), segments, words)
            }
            // Deterministic, breadth-first key order (root, then by depth then name) keeps the
            // serialized body byte-stable so the cc.json checksum is reproducible.
            .sortedWith(compareBy({ it.segments.size }, { it.segments.joinToString(SEGMENT_SEPARATOR) }))
            .forEach { node -> domainLens.add(node.id, toWordArray(node.words)) }

        return domainLens
    }

    private fun toWordArray(words: List<WordFrequency>): JsonArray {
        val array = JsonArray()
        words.forEach { word ->
            val wordObject = JsonObject()
            wordObject.addProperty(TEXT_KEY, word.text)
            wordObject.addProperty(FREQUENCY_KEY, word.frequency)
            // Preserve the historical omit-when-null behavior: no `tfidf` key rather than `"tfidf": null`.
            if (word.tfidf != null) {
                wordObject.addProperty(TFIDF_KEY, word.tfidf)
            }
            array.add(wordObject)
        }
        return array
    }

    // PathFactory performs the structural half of NodeId's canonicalization (drops "" and ".",
    // collapses ".."), so "." maps to the empty (root) segment list and file/dir paths yield the exact
    // segments the files-tree writer uses to derive node ids. extractOSIndependentPath detects the
    // separator so backslash-keyed Windows file paths split the same way the forward-slashed directory
    // keys do — keeping the tree structure and the domain-lens keys aligned on every platform.
    private fun segmentsOf(path: String): List<String> = PathFactory.extractOSIndependentPath(path).edgesList

    private data class DomainNode(val id: String, val segments: List<String>, val words: List<WordFrequency>)

    companion object {
        private const val SEGMENT_SEPARATOR = "/"

        // Word-entry field names — the `domain` lens wire schema, single-sourced.
        private const val TEXT_KEY = "text"
        private const val FREQUENCY_KEY = "frequency"
        private const val TFIDF_KEY = "tfidf"
    }
}
