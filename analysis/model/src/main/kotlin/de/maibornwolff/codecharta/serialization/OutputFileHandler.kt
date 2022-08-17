package de.maibornwolff.codecharta.serialization

import java.io.BufferedWriter
import java.io.File
import java.io.FileWriter
import java.io.OutputStreamWriter
import java.io.PrintStream
import java.io.Writer
import java.nio.file.Paths
import kotlin.io.path.name

object OutputFileHandler {
    fun writer(outputFilePath: String?, output: PrintStream): Writer {
        return if (outputFilePath.isNullOrBlank()) {
            OutputStreamWriter(output)
        } else {
            BufferedWriter(FileWriter(File(checkAndFixFileExtension(outputFilePath))))
        }
    }

    fun checkAndFixFileExtension(outputName: String): String {
        if (outputName.endsWith("cc.json")) {
            return outputName
        }
        val sb = StringBuilder()
        sb.append(Paths.get(outputName).parent?.toString() ?: "")
        if (sb.isNotEmpty()) {
            sb.append(File.separator)
        }
        sb.append(extractFileName(outputName))
        return sb.toString()
    }

    private fun extractFileName(outputName: String): String {
        val fileName = Paths.get(outputName).fileName.name
        if (fileName.substringAfterLast(".").equals("json")) {
            return fileName.substringBeforeLast(".") + ".cc.json"
        }
        return fileName.dropLastWhile { it.equals('.') }.dropWhile { it.equals('.') } + ".cc.json"
    }
}
