package de.maibornwolff.codecharta.serialization

import com.google.gson.GsonBuilder
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypeSerializer
import de.maibornwolff.codecharta.model.BlacklistType
import de.maibornwolff.codecharta.model.BlacklistTypeSerializer
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectWrapper
import de.maibornwolff.codecharta.util.Logger
import java.io.File
import java.io.IOException
import java.io.OutputStream
import java.io.Writer
import java.nio.charset.StandardCharsets.UTF_8
import java.util.zip.GZIPOutputStream

/**
 * This class provides static methods and functions to convert a Project-Object to json
 */
object ProjectSerializer {
    private val GSON =
        GsonBuilder()
            .registerTypeAdapter(AttributeType::class.java, AttributeTypeSerializer())
            .registerTypeAdapter(BlacklistType::class.java, BlacklistTypeSerializer())
            .create()

    /**
     * This method serializes a Project-Object to json and writes using given writer
     *
     * @param project the Project-Object to be serialized
     * @param out writer to write serialized object
     */
    @Throws(IOException::class)
    fun serializeProject(project: Project, out: Writer, writeToFile: Boolean = false) {
        val wrappedProject = getWrappedProject(project)
        GSON.toJson(wrappedProject, out)
        out.flush()
        if (writeToFile) {
            out.close()
        }
    }

    /**
     * This method serializes a Project-Object to json and writes it to an OutputStream, either GZIP-compressed
     * or as plain text.
     *
     * @param project the Project-Object to be serialized
     * @param out OutputStream to write serialized object
     * @param compress whether the output should be GZIP compressed
     */
    @Throws(IOException::class)
    fun serializeProject(project: Project, out: OutputStream, compress: Boolean, isOutputFileSpecified: Boolean = false) {
        val wrappedOut = if (compress && isOutputFileSpecified) GZIPOutputStream(out) else out
        val writer = wrappedOut.bufferedWriter(UTF_8)
        serializeProject(project, writer, isOutputFileSpecified)
    }

    /**
     * This method serializes a Project-Object to json and writes it to the specified file, or if no file is specified,
     * to the OutputStream. If a file is specified, and compress is true, the output will be GZIP compressed.
     *
     * @param project the Project-Object to be serialized
     * @param outputFilePath file to write the serialized object to
     * @param fallbackOutputStream OutputStream to write serialized object to if no filename was given
     * @param compress whether the output should be GZIP compressed (only respected if written to file)
     */
    @Throws(IOException::class)
    fun serializeToFileOrStream(project: Project, outputFilePath: String?, fallbackOutputStream: OutputStream, compress: Boolean) {
        val isOutputFileSpecified = !outputFilePath.isNullOrEmpty()
        val stream = OutputFileHandler.stream(outputFilePath, fallbackOutputStream, compress)
        serializeProject(project, stream, compress, isOutputFileSpecified)
        if (isOutputFileSpecified) {
            val absoluteFilePath =
                OutputFileHandler.checkAndFixFileExtension(
                    File(outputFilePath!!).absolutePath,
                    compress,
                    FileExtension.JSON
                )
            Logger.info {
                "Created output file at $absoluteFilePath"
            }
        }
    }

    /**
     * This method serializes a Project-Object to JSON and returns the string value
     *
     * @param project the Project-Object to be serialized
     */
    fun serializeToString(project: Project): String {
        val wrappedProject = getWrappedProject(project)
        return GSON.toJson(wrappedProject)
    }

    private fun getWrappedProject(project: Project): ProjectWrapper {
        val projectJsonString = GSON.toJson(project, Project::class.java)
        return ProjectWrapper(project, projectJsonString.toString())
    }
}
