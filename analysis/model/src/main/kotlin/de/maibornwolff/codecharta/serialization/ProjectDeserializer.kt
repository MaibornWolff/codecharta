package de.maibornwolff.codecharta.serialization

import com.google.gson.GsonBuilder
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypeDeserializer
import de.maibornwolff.codecharta.model.BlacklistType
import de.maibornwolff.codecharta.model.BlacklistTypeDeserializer
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectWrapper
import de.maibornwolff.codecharta.serialization.dto.CcJsonV2
import de.maibornwolff.codecharta.util.Logger
import java.io.FileInputStream
import java.io.InputStream
import java.io.Reader

object ProjectDeserializer {
    private val GSON =
        GsonBuilder()
            .registerTypeAdapter(Node::class.java, NodeJsonDeserializer())
            .registerTypeAdapter(Project::class.java, ProjectJsonDeserializer())
            .registerTypeAdapter(BlacklistType::class.java, BlacklistTypeDeserializer())
            .registerTypeAdapter(AttributeType::class.java, AttributeTypeDeserializer())
            .registerTypeAdapter(ProjectWrapper::class.java, ProjectWrapperJsonDeserializer())
            .create()

    fun deserializeProject(reader: Reader): Project = parseProject(reader.readText())

    fun deserializeProject(projectString: String): Project = parseProject(projectString)

    fun deserializeProject(input: FileInputStream): Project =
        parseProject(CompressedStreamHandler.wrapInput(input).bufferedReader().readText())

    fun deserializeProject(input: InputStream): Project? {
        val content = CompressedStreamHandler.wrapInput(input)
        val projectString = ProjectInputReader.extractProjectString(content)
        if (projectString.length <= 1) return null

        return try {
            parseProject(projectString)
        } catch (e: Exception) {
            Logger.error {
                "Piped input: $projectString"
            }
            Logger.error {
                "The piped input is not a valid project."
            }
            null
        }
    }

    /** Auto-detects the format by apiVersion major and routes to the matching reader (1.5 or 2.0). */
    private fun parseProject(projectString: String): Project {
        val jsonObject = JsonParser.parseString(projectString).asJsonObject
        return if (isVersionTwo(jsonObject)) {
            CcJsonV2ToProjectMapper.toProject(CcJsonV2Gson.gson.fromJson(jsonObject, CcJsonV2::class.java))
        } else {
            GSON.fromJson(jsonObject, ProjectWrapper::class.java).data
        }
    }

    private fun isVersionTwo(jsonObject: JsonObject): Boolean {
        val metaApiVersion = jsonObject.getAsJsonObject("meta")?.get("apiVersion")?.asString
        if (metaApiVersion != null) return metaApiVersion.substringBefore('.') == "2"
        return jsonObject.has("lenses")
    }
}
