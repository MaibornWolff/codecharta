package de.maibornwolff.codecharta.serialization

import com.google.gson.GsonBuilder
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectWrapper
import java.io.FileOutputStream
import java.io.IOException
import java.io.OutputStream
import java.io.Writer
import java.nio.charset.StandardCharsets.UTF_8
import java.util.zip.GZIPOutputStream

/**
 * This class provides static methods and functions to convert a Project-Object to json
 */
object ProjectSerializer {

    private val GSON = GsonBuilder().create()

    /**
     * This method serializes a Project-Object to json and writes using given writer
     *
     * @param project the Project-Object to be serialized
     * @param out writer to write serialized object
     */
    @Throws(IOException::class)
    fun serializeProject(project: Project, out: Writer) {
        val wrappedProject = getWrappedProject(project)
        GSON.toJson(wrappedProject, out)
        out.flush()
        out.close()
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
    fun serializeProject(project: Project, out: OutputStream, compress: Boolean) {
        val wrappedOut = if (compress) GZIPOutputStream(out) else out
        val writer = wrappedOut.bufferedWriter(UTF_8)
        serializeProject(project, writer)
    }

    /**
     * This method serializes a Project-Object to json and writes it to the specified file, or if no file is specified,
     * to the an OutputStream. If a file is specified, and compress is true, the output will be GZIP compressed.
     *
     * @param project the Project-Object to be serialized
     * @param outputFilePath file to write the serialized object to
     * @param fallbackOutputStream OutputStream to write serialized object to if no filename was given
     * @param compress whether the output should be GZIP compressed (only respected if written to file)
     */
    @Throws(IOException::class)
    fun serializeToFileOrStream(project: Project, outputFilePath: String?, fallbackOutputStream: OutputStream, compress: Boolean) {
        val reallyCompress = compress && !outputFilePath.isNullOrEmpty()
        val stream = OutputFileHandler.stream(outputFilePath, fallbackOutputStream, reallyCompress)
        serializeProject(project, stream, reallyCompress)
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

    /**
     * This method serializes a Project-Object to json and compresses it to gzip
     *
     * @param project the Project-Object to be serialized
     * @param absolutePath the path of the compressed file
     */

    fun serializeAsCompressedFile(project: Project, absolutePath: String) {
        val fixedPath = OutputFileHandler.checkAndFixFileExtension(absolutePath, true)
        serializeProject(project, FileOutputStream(fixedPath), true)
    }

    private fun getWrappedProject(project: Project): ProjectWrapper {
        val projectJsonString = GSON.toJson(project, Project::class.java)
        return ProjectWrapper(project, projectJsonString.toString())
    }
}
