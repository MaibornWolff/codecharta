package de.maibornwolff.codecharta.serialization

import com.google.gson.Gson
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.util.FileExtension
import de.maibornwolff.codecharta.util.Logger
import java.io.File
import java.io.IOException
import java.io.OutputStream
import java.io.Writer
import java.util.zip.GZIPOutputStream

object ProjectSerializer {
    // Only the 2.0 format is emitted, and this is the single point that decides it
    private fun wire(project: Project): Pair<Gson, Any> = CcJsonV2Gson.gson to ProjectToCcJsonV2Mapper.toDto(project)

    @Throws(IOException::class)
    fun serializeProject(project: Project, out: Writer, writeToFile: Boolean = false) {
        val (gson, wireObject) = wire(project)
        gson.toJson(wireObject, out)
        out.flush()
        if (writeToFile) {
            out.close()
        }
    }

    @Throws(IOException::class)
    fun serializeProject(project: Project, out: OutputStream, compress: Boolean, isOutputFileSpecified: Boolean = false) {
        // Single-pass byte writer: the {files, lenses} body is serialized once and its bytes are reused
        // for both the meta.checksum and the output, instead of serializing the whole body twice.
        val wrappedOut = if (compress && isOutputFileSpecified) GZIPOutputStream(out) else out
        ProjectToCcJsonV2Mapper.writeProject(project, wrappedOut)
        wrappedOut.flush()
        if (isOutputFileSpecified) {
            wrappedOut.close()
        }
    }

    // Compression applies only to an output file, never to the fallback stream
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

    fun serializeToString(project: Project): String {
        val (gson, wireObject) = wire(project)
        return gson.toJson(wireObject)
    }
}
