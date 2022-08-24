package de.maibornwolff.codecharta.serialization

import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream
import java.io.PrintStream
import java.io.Writer
import java.nio.charset.StandardCharsets.UTF_8

object OutputFileHandler {
    fun stream(outputFilePath: String?, fallbackOutputStream: OutputStream, compressed: Boolean): OutputStream {
        return if (outputFilePath.isNullOrBlank()) {
            fallbackOutputStream
        } else {
            FileOutputStream(File(checkAndFixFileExtension(outputFilePath, compressed)))
        }
    }

    fun writer(outputFilePath: String?, output: PrintStream): Writer {
        return stream(outputFilePath, output, false).bufferedWriter(UTF_8)
    }

    fun checkAndFixFileExtension(outputName: String, compressed: Boolean): String =
            outputName.removeSuffix(".gz").removeSuffix(".json").removeSuffix(".cc") + getExtension(compressed)

    fun getExtension(compressed: Boolean) =
            if (compressed) ".cc.json.gz" else ".cc.json"
}
