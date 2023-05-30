package de.maibornwolff.codecharta.util

import mu.KotlinLogging
import java.io.File
import java.lang.IllegalArgumentException

class InputHelper {
    companion object {
        private val logger = KotlinLogging.logger {}

        /**
         * Returns list of the specified files (and all contained files if resource is directory and flag is given) if all conditions are met to consider input valid, otherwise throws IllegalArgumentException.
         * If input can be piped, we check if all input resources exist and folders are not empty.
         * If input can not be piped, we check for that as well and additionally check if input is not empty.
         * An error is also thrown, if a folder is input, but `canInputContainFolders` is set to `false`.
         */
        fun getInputFileListIfValid(inputResources: Array<File>,
                                    canInputBePiped: Boolean,
                                    canInputContainFolders: Boolean): MutableList<File> {
            val isInputValid = isInputValid(inputResources, canInputBePiped, canInputContainFolders)

            return if (isInputValid) {
                getFileListFromValidatedFileArray(inputResources)
            } else {
                throw IllegalArgumentException("Invalid input resources (file/folder) specified!")
            }
        }

        private fun isInputValid(inputResources: Array<File>,
                                 canInputBePiped: Boolean,
                                 canInputContainFolders: Boolean): Boolean {
            return if (canInputBePiped) {
                areInputResourcesValid(inputResources, canInputContainFolders)
            } else {
                !isInputEmpty(inputResources) && areInputResourcesValid(inputResources, canInputContainFolders)
            }
        }

        private fun isInputEmpty(inputResources: Array<File>): Boolean {
            if (inputResources.isEmpty()) {
                logger.error("Did not find any input resources!")
                return true
            }
            return false
        }

        private fun doesInputExist(inputResource: File): Boolean {
            if (!inputResource.exists()) {
                logger.error("Could not find file `${ inputResource.path }`!")
                return false
            }
            return true
        }

        private fun isResourceValid(inputResource: File,
                                    canInputContainFolders: Boolean): Boolean {
            if (canInputContainFolders) {
                if (inputResource.isDirectory && getFilesInFolder(inputResource).isEmpty()) {
                    logger.error("The specified path `${ inputResource.path }` exists but is empty!")
                    return false
                }
                return true
            } else {
                if (inputResource.isDirectory) {
                    logger.error("Input folder where only files are allowed!")
                    return false
                }
                return true
            }
        }

        private fun areInputResourcesValid(inputResources: Array<File>,
                                           canInputContainFolders: Boolean): Boolean {
            var isInputValid = true

            for (source in inputResources) {
                if (!doesInputExist(source)) {
                    isInputValid = false
                } else {
                    if (!isResourceValid(source, canInputContainFolders)) {
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
