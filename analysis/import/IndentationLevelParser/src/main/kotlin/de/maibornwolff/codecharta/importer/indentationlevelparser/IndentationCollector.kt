package de.maibornwolff.codecharta.importer.indentationlevelparser

import java.io.File
import java.io.PrintStream
import java.nio.file.Paths

class IndentationCollector(private var root: File,
                           private val tabWidth: Int = 0,
                           private val maxIndentationLevel: Int = 10,
                           private val stderr: PrintStream = System.err,
                           private val exclude: Array<String> = arrayOf(),
                           private val verbose: Boolean = false) {

    fun parse(): Map<String, FileMetrics> {
        val projectMetrics = mutableMapOf<String, FileMetrics>()
        val excludePatterns = exclude.joinToString(separator = "|", prefix = "(", postfix = ")").toRegex()

        root.walk().forEach {
            if (it.isFile) {
                val standardizedPath = "/" + getRelativeFileName(it.toString())
                if (it.isFile && !(exclude.isNotEmpty() && excludePatterns.containsMatchIn(standardizedPath))) {
                    projectMetrics[standardizedPath] = parseFile(it)
                }
            }
        }
        return projectMetrics
    }

    private fun parseFile(file: File): FileMetrics {
        val indentationCounter = IndentationCounter(maxIndentationLevel, stderr, verbose)
        file.readLines().forEach { indentationCounter.addIndentationForLine(it) }
        return indentationCounter.getIndentationLevels(tabWidth)
    }

    private fun getRelativeFileName(fileName: String): String {
        if (root.isFile) root = root.parentFile

        return root.toPath().toAbsolutePath()
                .relativize(Paths.get(fileName).toAbsolutePath())
                .toString()
                .replace('\\', '/')
    }
}