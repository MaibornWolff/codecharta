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

    fun checkAndFixFileExtension(outputName: String): String {
        if (outputName.endsWith("cc.json")) {
            return outputName
        }
        return (Paths.get(outputName).parent?.toString() ?: "").plus(
                Paths.get(outputName).root?.toString() ?: "").plus(extractFileName(outputName))
    }

     fun writer(outputName: String?, output: PrintStream): Writer {
         return if (outputName.isNullOrBlank()) {
             OutputStreamWriter(output)
         } else {
             BufferedWriter(FileWriter(File(checkAndFixFileExtension(outputName ?: ""))))
         }
     }

    private fun extractFileName(outputName: String): String {
        val fileName = Paths.get(outputName).fileName.name
        if (fileName.substringAfterLast(".").equals("json")) {
            return fileName.substringBeforeLast(".") + ".cc.json"
        }
        return fileName.dropLastWhile { it.equals('.') }.dropWhile { it.equals('.') } + ".cc.json"
    }
}
