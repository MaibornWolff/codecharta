package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output

import com.google.gson.JsonArray
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import de.maibornwolff.codecharta.model.LensSet
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class DomainProjectGeneratorTest {
    private fun sampleResult(): DomainAnalysisResult = DomainAnalysisResult(
        filePaths = listOf("src/main/App.kt", "src/util/Helper.kt", "README.md"),
        wordsByPath =
            mapOf(
                "." to listOf(WordFrequency("domain", 5, 0.42)),
                "src" to listOf(WordFrequency("app", 3)),
                "src/main" to listOf(WordFrequency("app", 2)),
                "src/util" to listOf(WordFrequency("helper", 1)),
                "src/main/App.kt" to listOf(WordFrequency("app", 2)),
                "src/util/Helper.kt" to listOf(WordFrequency("helper", 1)),
                "README.md" to listOf(WordFrequency("readme", 1))
            )
    )

    private fun serialize(project: Project): JsonObject = JsonParser.parseString(ProjectSerializer.serializeToString(project)).asJsonObject

    private fun domainNodes(json: JsonObject): JsonObject = json
        .getAsJsonObject("lenses")
        .getAsJsonObject(LensSet.DOMAIN_KEY)
        .getAsJsonObject("nodes")

    private fun wordsOf(json: JsonObject, nodeId: String): JsonArray = domainNodes(json).getAsJsonObject(nodeId).getAsJsonArray("words")

    private fun collectFileIds(files: JsonArray): Set<String> {
        val ids = mutableSetOf<String>()
        files.forEach { element ->
            val fileObject = element.asJsonObject
            ids.add(fileObject.get("id").asString)
            fileObject.get("children")?.takeIf { !it.isJsonNull }?.let { ids.addAll(collectFileIds(it.asJsonArray)) }
        }
        return ids
    }

    @Test
    fun `should emit cc json 2 0 with a domain lens`() {
        // Arrange
        val result = sampleResult()

        // Act
        val json = serialize(DomainProjectGenerator().generate(result))

        // Assert
        assertEquals("2.0", json.getAsJsonObject("meta").get("apiVersion").asString)
        assertTrue(json.getAsJsonObject("lenses").getAsJsonObject(LensSet.DOMAIN_KEY).has("nodes"))
    }

    @Test
    fun `should key the domain lens by node ids that resolve against the files tree`() {
        // Arrange
        val result = sampleResult()

        // Act
        val json = serialize(DomainProjectGenerator().generate(result))
        val fileIds = collectFileIds(json.getAsJsonArray("files"))
        val domainKeys = domainNodes(json).keySet()

        // Assert - every domain lens key is an id emitted into the files tree
        assertTrue(domainKeys.isNotEmpty())
        assertTrue(fileIds.containsAll(domainKeys), "domain keys ${domainKeys - fileIds} are not present as file ids")
    }

    @Test
    fun `should compute file and folder and root ids with the matching node type`() {
        // Arrange
        val result = sampleResult()

        // Act
        val domainKeys = domainNodes(serialize(DomainProjectGenerator().generate(result))).keySet()

        // Assert - leaf keyed as File, directory keyed as Folder, root keyed as empty-segment Folder
        assertTrue(domainKeys.contains(NodeId.fromSegments(listOf("src", "main", "App.kt"), NodeType.File)))
        assertTrue(domainKeys.contains(NodeId.fromSegments(listOf("src", "main"), NodeType.Folder)))
        assertTrue(domainKeys.contains(NodeId.fromSegments(emptyList(), NodeType.Folder)))
    }

    @Test
    fun `should carry the words for a node into its domain lens entry`() {
        // Arrange
        val result = sampleResult()
        val appId = NodeId.fromSegments(listOf("src", "main", "App.kt"), NodeType.File)

        // Act
        val words = wordsOf(serialize(DomainProjectGenerator().generate(result)), appId)

        // Assert
        val firstWord = words.first().asJsonObject
        assertEquals("app", firstWord.get("text").asString)
        assertEquals(2, firstWord.get("frequency").asInt)
    }

    @Test
    fun `should include tfidf when present and omit it when null`() {
        // Arrange
        val result = sampleResult()

        // Act
        val json = serialize(DomainProjectGenerator().generate(result))
        val rootWord = wordsOf(json, NodeId.fromSegments(emptyList(), NodeType.Folder)).first().asJsonObject
        val appWord = wordsOf(json, NodeId.fromSegments(listOf("src", "main", "App.kt"), NodeType.File)).first().asJsonObject

        // Assert
        assertTrue(rootWord.has("tfidf"))
        assertEquals(0.42, rootWord.get("tfidf").asDouble)
        assertFalse(appWord.has("tfidf"))
    }

    @Test
    fun `should produce identical output across runs for the same input`() {
        // Arrange
        val result = sampleResult()

        // Act
        val first = ProjectSerializer.serializeToString(DomainProjectGenerator().generate(result))
        val second = ProjectSerializer.serializeToString(DomainProjectGenerator().generate(result))

        // Assert - byte-stable output (and therefore a reproducible checksum)
        assertEquals(first, second)
    }

    @Test
    fun `should align domain keys with the files tree for backslash separated file paths`() {
        // Arrange - a Windows-style file path (backslash separators) with forward-slashed directory keys
        val result =
            DomainAnalysisResult(
                filePaths = listOf("src\\main\\App.kt"),
                wordsByPath =
                    mapOf(
                        "." to listOf(WordFrequency("domain", 1)),
                        "src" to listOf(WordFrequency("app", 1)),
                        "src/main" to listOf(WordFrequency("app", 1)),
                        "src\\main\\App.kt" to listOf(WordFrequency("app", 1))
                    )
            )

        // Act
        val json = serialize(DomainProjectGenerator().generate(result))
        val fileIds = collectFileIds(json.getAsJsonArray("files"))
        val domainKeys = domainNodes(json).keySet()

        // Assert - the backslash file path builds a nested tree and every domain key resolves against it
        assertTrue(fileIds.contains(NodeId.fromSegments(listOf("src", "main", "App.kt"), NodeType.File)))
        assertTrue(fileIds.contains(NodeId.fromSegments(listOf("src", "main"), NodeType.Folder)))
        assertTrue(fileIds.containsAll(domainKeys), "domain keys ${domainKeys - fileIds} are not present as file ids")
    }

    @Test
    fun `should emit an empty lens and a root only tree for an empty analysis`() {
        // Arrange
        val result = DomainAnalysisResult(filePaths = emptyList(), wordsByPath = emptyMap())

        // Act
        val json = serialize(DomainProjectGenerator().generate(result))

        // Assert - no domain entries, and the tree carries only the root folder (no leaves)
        assertTrue(domainNodes(json).keySet().isEmpty())
        assertEquals(setOf(NodeId.fromSegments(emptyList(), NodeType.Folder)), collectFileIds(json.getAsJsonArray("files")))
    }
}
