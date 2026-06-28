package de.maibornwolff.codecharta.serialization

import com.google.gson.GsonBuilder
import com.google.gson.JsonObject
import com.google.gson.JsonParseException
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

    fun deserializeProject(reader: Reader, allowLegacy: Boolean = false): Project = parseProject(reader.readText(), allowLegacy)

    fun deserializeProject(projectString: String, allowLegacy: Boolean = false): Project = parseProject(projectString, allowLegacy)

    fun deserializeProject(input: FileInputStream, allowLegacy: Boolean = false): Project =
        parseProject(CompressedStreamHandler.wrapInput(input).bufferedReader().readText(), allowLegacy)

    fun deserializeProject(input: InputStream, allowLegacy: Boolean = false): Project? {
        val content = CompressedStreamHandler.wrapInput(input)
        val projectString = ProjectInputReader.extractProjectString(content)
        if (projectString.length <= 1) return null

        return try {
            parseProject(projectString, allowLegacy)
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

    /**
     * Auto-detects the format by apiVersion major and routes to the matching reader. 2.0 is read
     * everywhere; 1.x is read only when [allowLegacy] is set — i.e. only by `ccsh convert`. Every other
     * command rejects a 1.x file and points the user at `convert`.
     */
    private fun parseProject(projectString: String, allowLegacy: Boolean): Project {
        val parsed = JsonParser.parseString(projectString)
        if (!parsed.isJsonObject) {
            throw JsonParseException("not a valid cc.json document: expected a JSON object at the top level")
        }
        val jsonObject = parsed.asJsonObject
        return when (detectApiVersion(jsonObject)) {
            ApiVersion.TWO_ZERO -> CcJsonV2ToProjectMapper.toProject(CcJsonV2Gson.gson.fromJson(jsonObject, CcJsonV2::class.java))
            ApiVersion.ONE_FIVE -> {
                if (!allowLegacy) {
                    throw JsonParseException(
                        "This is a legacy cc.json 1.x file. Run `ccsh convert <file>` to upgrade it to the 2.0 format first."
                    )
                }
                GSON.fromJson(jsonObject, ProjectWrapper::class.java).data
            }
        }
    }

    private fun detectApiVersion(jsonObject: JsonObject): ApiVersion {
        // getAsJsonObject throws if "meta" is present but not an object, so check the type first.
        val meta = jsonObject.get("meta")?.takeIf { it.isJsonObject }?.asJsonObject
        val metaApiVersion = meta?.get("apiVersion")?.takeIf { it.isJsonPrimitive }?.asString
        // No meta.apiVersion: a 2.0 file still has "lenses", a legacy 1.5 file has neither.
        val major = metaApiVersion?.substringBefore('.') ?: if (jsonObject.has("lenses")) "2" else "1"
        return ApiVersion.entries.firstOrNull { it.major.toString() == major }
            ?: throw JsonParseException("unsupported cc.json version $major (supported: 1.x, 2.x)")
    }
}
