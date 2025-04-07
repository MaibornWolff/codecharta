package de.maibornwolff.codecharta.serialization

import com.google.gson.GsonBuilder
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypeDeserializer
import de.maibornwolff.codecharta.model.BlacklistType
import de.maibornwolff.codecharta.model.BlacklistTypeDeserializer
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectWrapper
import de.maibornwolff.codecharta.util.Logger
import java.io.FileInputStream
import java.io.InputStream
import java.io.Reader

object ProjectDeserializer {
    private val GSON =
        GsonBuilder().registerTypeAdapter(Node::class.java, NodeJsonDeserializer())
            .registerTypeAdapter(Project::class.java, ProjectJsonDeserializer())
            .registerTypeAdapter(BlacklistType::class.java, BlacklistTypeDeserializer())
            .registerTypeAdapter(AttributeType::class.java, AttributeTypeDeserializer())
            .registerTypeAdapter(ProjectWrapper::class.java, ProjectWrapperJsonDeserializer()).create()

    fun deserializeProject(reader: Reader): Project {
        val projectWrapper = GSON.fromJson(reader, ProjectWrapper::class.java)
        return projectWrapper.data
    }

    fun deserializeProject(projectString: String): Project {
        val projectWrapper = GSON.fromJson(projectString, ProjectWrapper::class.java)
        return projectWrapper.data
    }

    fun deserializeProject(input: FileInputStream): Project {
        val projectWrapper =
            GSON.fromJson(CompressedStreamHandler.wrapInput(input).bufferedReader(), ProjectWrapper::class.java)
        return projectWrapper.data
    }

    fun deserializeProject(input: InputStream): Project? {
        val content = CompressedStreamHandler.wrapInput(input)
        val projectString = ProjectInputReader.extractProjectString(content)
        if (projectString.length <= 1) return null

        return try {
            deserializeProject(projectString)
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
}
