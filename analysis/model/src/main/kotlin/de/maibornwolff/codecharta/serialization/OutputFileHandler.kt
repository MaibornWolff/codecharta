package de.maibornwolff.codecharta.serialization

import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

object OutputFileHandler {
    fun stream(outputFilePath: String?, fallbackOutputStream: OutputStream, compressed: Boolean): OutputStream {
        return if (outputFilePath.isNullOrBlank()) {
            fallbackOutputStream
        } else {
            FileOutputStream(File(checkAndFixFileExtension(outputFilePath, compressed)))
        }
    }

    fun checkAndFixFileExtension(outputName: String, compressed: Boolean): String =
            outputName.removeSuffix(".gz").removeSuffix(".json").removeSuffix(".cc") + getExtension(compressed)

    fun getExtension(compressed: Boolean) =
            if (compressed) ".cc.json.gz" else ".cc.json"
}
