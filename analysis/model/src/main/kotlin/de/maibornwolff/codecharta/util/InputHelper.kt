package de.maibornwolff.codecharta.util

import mu.KotlinLogging
import java.io.File

class InputHelper {
    companion object {
        private val logger = KotlinLogging.logger {}

        fun getAndCheckAllSpecifiedInputFiles(inputFiles: Array<File>): MutableList<File> {
            val resultList = mutableListOf<File>()
            var doesInputContainNonexistentFile = false

            for (source in inputFiles) {
                if (!source.exists()) {
                    logger.error("Could not find file `${ source.path }` and did not merge!")
                    doesInputContainNonexistentFile = true
                } else {
                    resultList.addAll(getFilesInFolder(source))
                }
            }

            return if (doesInputContainNonexistentFile) {
                mutableListOf()
            } else {
                resultList
            }
        }

        private fun getFilesInFolder(folder: File): List<File> {
            val files = folder.walk().filter { !it.name.startsWith(".") && !it.isDirectory }
            return files.toList()
        }
    }
}
