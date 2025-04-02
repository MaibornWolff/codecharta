package de.maibornwolff.codecharta.analysers.filters.mergefilter.mimo

import de.maibornwolff.codecharta.analysers.analyserinterface.runInTerminalSession
import de.maibornwolff.codecharta.analysers.filters.mergefilter.Dialog
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
            } else if (maxLevenshteinDistance > 0 && levenshteinDistance(ogPrefix, compPrefix) <= maxLevenshteinDistance) {
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

        private fun levenshteinDistance(lhs: CharSequence, rhs: CharSequence): Int {
            val lhsLength = lhs.length
            val rhsLength = rhs.length

            var cost = IntArray(rhsLength + 1) { it }
            var newCost = IntArray(rhsLength + 1)

            for (i in 1..lhsLength) {
                newCost[0] = i

                for (j in 1..rhsLength) {
                    val match = if (lhs[i - 1] == rhs[j - 1]) 0 else 1
                    val costReplace = cost[j - 1] + match
                    val costInsert = cost[j] + 1
                    val costDelete = newCost[j - 1] + 1

                    newCost[j] = minOf(costInsert, costDelete, costReplace)
                }

                val swap = cost
                cost = newCost
                newCost = swap
            }

            return cost[rhsLength]
        }

        fun assembleOutputFilePath(filePath: String?, fileName: String): String {
            return if (filePath.isNullOrEmpty()) {
                fileName
            } else if (File(filePath).isDirectory) {
                "${File(filePath).path}/$fileName"
            } else {
                throw IllegalArgumentException("Please specify a folder for MIMO output or nothing")
            }
        }
    }
}
