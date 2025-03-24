package de.maibornwolff.codecharta.util

import de.maibornwolff.codecharta.serialization.FileExtension
import java.io.File

class ResourceSearchHelper {
    companion object {
        fun isFolderDirectlyInGivenDirectory(directoryPath: String, toBeSearchedFolder: String): Boolean {
            val inputFile = getFileFromStringIfExists(directoryPath) ?: return false
            if (!inputFile.isDirectory) {
                return false
            } else if (isInputFileNameSearchToken(inputFile, toBeSearchedFolder)) {
                return true
            }

            println("Did not find folder directly, scanning directory `${inputFile.absolutePath}` if folder exists at top level.")
            return inputFile.walk().maxDepth(1).asSequence().filter {
                it.isDirectory && isInputFileNameSearchToken(it, toBeSearchedFolder)
            }.any()
        }

        fun isFileWithOneOrMoreOfEndingsPresent(resourcePath: String, toBeCheckedFileEndings: List<FileExtension>): Boolean {
            val inputFile = getFileFromStringIfExists(resourcePath) ?: return false
            if (inputFile.isFile && endsWithAtLeastOne(inputFile.name, toBeCheckedFileEndings)) {
                return true
            }

            if (!inputFile.isDirectory) {
                return false
            }

            println(
                "Given resource did not end with any of the supplied file endings. " +
                    "Scanning directory `${inputFile.absolutePath}` if it contains a file with any of the supplied file endings."
            )
            return inputFile.walk().asSequence().filter {
                it.isFile && endsWithAtLeastOne(it.name, toBeCheckedFileEndings)
            }.any()
        }

        fun isSearchableDirectory(inputFile: File): Boolean {
            return (inputFile.isDirectory && inputFile.name != "")
        }

        fun getFileFromStringIfExists(inputPath: String): File? {
            if (inputPath == "") {
                return null
            }
            val result = File(inputPath.trim())
            if (result.exists()) {
                return result
            }
            return null
        }

        private fun isInputFileNameSearchToken(inputFile: File, searchToken: String): Boolean {
            return (inputFile.name == searchToken)
        }

        fun endsWithAtLeastOne(inputString: String, endings: List<FileExtension>): Boolean {
            for (ending in endings) {
                if (inputString.endsWith(ending.extension)) {
                    return true
                }
            }
            return false
        }
    }
}
