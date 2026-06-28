package de.maibornwolff.codecharta.serialization

import com.google.gson.Gson
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.util.Logger
import java.io.File
import java.io.IOException
import java.io.OutputStream
import java.io.Writer
import java.nio.charset.StandardCharsets.UTF_8
import java.util.zip.GZIPOutputStream

/**
 * Converts a [Project] to json. `ccsh` only ever emits the cc.json 2.0 `{ meta, files, lenses }`
 * format — there is no 1.5 writer. The 1.5 format is still *readable* (see [ProjectDeserializer]),
 * but it is never produced.
 */
object ProjectSerializer {
    /** The wire object + its GSON. Only the 2.0 format is emitted — this is the single dispatch point. */
    private fun wire(project: Project): Pair<Gson, Any> = CcJsonV2Gson.gson to ProjectToCcJsonV2Mapper.toDto(project)

    /**
     * This method serializes a Project-Object to json and writes using given writer
     *
     * @param project the Project-Object to be serialized
     * @param out writer to write serialized object
     */
    @Throws(IOException::class)
    fun serializeProject(project: Project, out: Writer, writeToFile: Boolean = false) {
        val (gson, wireObject) = wire(project)
        gson.toJson(wireObject, out)
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
        if (!outputFilePath.isNullOrEmpty()) {
            val absoluteFilePath =
                OutputFileHandler.checkAndFixFileExtension(
                    File(outputFilePath).absolutePath,
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
        val (gson, wireObject) = wire(project)
        return gson.toJson(wireObject)
    }
}
