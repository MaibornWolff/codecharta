package de.maibornwolff.codecharta.analysers.filters.mergefilter

import de.maibornwolff.codecharta.analysers.analyserinterface.runInTerminalSession
import de.maibornwolff.codecharta.util.EditDistance
import de.maibornwolff.codecharta.util.Logger
import java.io.File

class Mimo {
    companion object {
        fun generateProjectGroups(sourceFiles: List<File>, maxLevenshteinDistance: Int): List<Pair<Boolean, List<File>>> {
            val mutableSourceFiles: MutableList<File> = sourceFiles.toMutableList()
            val groupedFiles: MutableList<Pair<Boolean, List<File>>> = mutableListOf()
            while (mutableSourceFiles.isNotEmpty()) {
                val currentFile = mutableSourceFiles.removeFirst()
                var exactMatch = true
                val currentFileList: MutableList<File> = mutableListOf()

                mutableSourceFiles.forEach {
                    val prefixMatch = evaluatePrefixMatch(currentFile, it, maxLevenshteinDistance)
                    if (prefixMatch == 0) {
                        currentFileList.add(it)
                    } else if (prefixMatch == 1) {
                        exactMatch = false
                        currentFileList.add(it)
                    }
                }

                mutableSourceFiles.removeAll(currentFileList)
                currentFileList.add(currentFile)

                if (currentFileList.size > 1) {
                    groupedFiles.add(Pair(exactMatch, currentFileList))
                } else {
                    Logger.info {
                        "Discarded '${currentFile.name.substringBefore(".")}' " +
                            "of ${currentFile.name} as a potential group"
                    }
                }
            }
            return groupedFiles
        }

        private fun evaluatePrefixMatch(original: File, comparison: File, maxLevenshteinDistance: Int): Int {
            val ogPrefix = original.name.substringBefore(".")
            val compPrefix = comparison.name.substringBefore(".")
            return if (ogPrefix == compPrefix) {
                0
            } else if (maxLevenshteinDistance > 0 && EditDistance.between(ogPrefix, compPrefix) <= maxLevenshteinDistance) {
                1
            } else {
                -1
            }
        }

        fun retrieveGroupName(files: List<String>): String {
            val filePrefixes = files.map { it.substringBefore(".") }.toSet()
            if (filePrefixes.size == 1) return filePrefixes.first()
            return runInTerminalSession { Dialog.askForMimoPrefix(this, filePrefixes) }
        }

        fun assembleOutputFilePath(filePath: String?, fileName: String): String = if (filePath.isNullOrEmpty()) {
            fileName
        } else if (File(filePath).isDirectory) {
            "${File(filePath).path}/$fileName"
        } else {
            throw IllegalArgumentException("Please specify a folder for MIMO output or nothing")
        }
    }
}
