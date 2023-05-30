package de.maibornwolff.codecharta.util

import mu.KotlinLogging
import java.io.File
import java.lang.IllegalArgumentException

class InputHelper {
    companion object {
        private val logger = KotlinLogging.logger {}

        /**
         * Returns list of the specified files if all conditions are met to consider input valid, otherwise throws IllegalArgumentException.
         * If input can be piped, we check if all input resources exist and folders are not empty.
         * If input can not be piped, we check for that as well and additionally check if input is not empty.
         */
        fun getInputFileListIfValid(inputResources: Array<File>, canInputBePiped: Boolean): MutableList<File> {
            val isInputValid = isInputValid(inputResources, canInputBePiped)

            return if (isInputValid) {
                getFileListFromValidatedFileArray(inputResources)
            } else {
                throw IllegalArgumentException()
            }
        }

        private fun isInputValid(inputResources: Array<File>, canInputBePiped: Boolean): Boolean {
            return if (canInputBePiped) {
                isAllInputExistentAndFoldersNotEmpty(inputResources)
            } else {
                !isInputEmpty(inputResources) && isAllInputExistentAndFoldersNotEmpty(inputResources)
            }
        }

        private fun isInputEmpty(inputResources: Array<File>): Boolean{
            if (inputResources.isEmpty()) {
                logger.error("Did not find any input files!")
                return true
            }
            return false
        }

        private fun isAllInputExistentAndFoldersNotEmpty(inputResources: Array<File>): Boolean{
            var isInputValid = true

            for (source in inputResources) {
                if (!source.exists()) {
                    logger.error("Could not find file `${ source.path }` and did not merge!")
                    isInputValid = false
                } else {
                    if (source.isDirectory && getFilesInFolder(source).isEmpty()) {
                        logger.error("The specified path `${ source.path }` exists but is empty!")
                        isInputValid = false
                    }
                }
            }
            return isInputValid
        }

        private fun getFileListFromValidatedFileArray(inputFiles: Array<File>): MutableList<File> {
            val resultList = mutableListOf<File>()
            for (source in inputFiles) {
                if (source.isDirectory) {
                    resultList.addAll(getFilesInFolder(source))
                } else {
                    resultList.add(source)
                }
            }
            return resultList
        }

        private fun getFilesInFolder(folder: File): List<File> {
            val files = folder.walk().filter { !it.name.startsWith(".") && !it.isDirectory }
            return files.toList()
        }
    }
}
