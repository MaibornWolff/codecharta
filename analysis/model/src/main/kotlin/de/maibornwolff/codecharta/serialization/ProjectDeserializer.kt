package de.maibornwolff.codecharta.serialization

import com.google.gson.GsonBuilder
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectWrapper
import model.src.main.kotlin.de.maibornwolff.codecharta.serialization.NodeJsonDeserializer
import mu.KotlinLogging
import java.io.FileInputStream
import java.io.InputStream
import java.io.Reader

object ProjectDeserializer {
    private val logger = KotlinLogging.logger {}

    private val GSON = GsonBuilder()
        .registerTypeAdapter(Node::class.java, NodeJsonDeserializer())
        .registerTypeAdapter(Project::class.java, ProjectJsonDeserializer())
        .registerTypeAdapter(ProjectWrapper::class.java, ProjectWrapperJsonDeserializer())
        .create()

    fun deserializeProject(reader: Reader): Project {
        val projectWrapper = GSON.fromJson(reader, ProjectWrapper::class.java)
        return projectWrapper.data
    }

    fun deserializeProject(projectString: String): Project {
        val projectWrapper = GSON.fromJson(projectString, ProjectWrapper::class.java)
        return projectWrapper.data
    }

    fun deserializeProject(input: FileInputStream): Project {
        val projectWrapper = GSON.fromJson(CompressedStreamHandler.wrapInput(input).bufferedReader(), ProjectWrapper::class.java)
        return projectWrapper.data
    }

    fun deserializeProject(input: InputStream): Project? {
        val content = CompressedStreamHandler.wrapInput(input)
        val projectString = content.mapLines { it }.joinToString(separator = "") { it }
        if (projectString.length <= 1) return null

        return try {
            deserializeProject(projectString)
        } catch (e: Exception) {
            logger.error { "Piped input: $projectString" }
            logger.error { "The piped input is not a valid project." }
            null
        }
    }
}
