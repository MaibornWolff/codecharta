package de.maibornwolff.codecharta.util

import mu.KotlinLogging
import java.io.File

class InputHelper {
    companion object {
        private val logger = KotlinLogging.logger {}

        /**
         * Checks if input resources meet a number of requirements:
         * The input array can not be empty.
         * If input can not contain folders, no element in the list can be a path to a folder.
         * All elements in the array have to either be existing files or if allowed, folders.
         */
        fun isInputValid(inputResources: Array<File>,
                         canInputContainFolders: Boolean): Boolean {
            return !isInputEmpty(inputResources) && areInputResourcesValid(inputResources, canInputContainFolders)
        }

        private fun isInputEmpty(inputResources: Array<File>): Boolean {
            if (inputResources.isEmpty()) {
                logger.error("Did not find any input resources!")
                return true
            }
            return false
        }

        private fun isInputExistentAndFolderOrFile(inputResource: File): Boolean {
            if (!(inputResource.isFile || inputResource.isDirectory)) {
                logger.error("Could not find resource `${ inputResource.path }`!")
                return false
            }
            return true
        }

        private fun isInputValidFolderOrAnyFile(inputResource: File,
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
                if (!isInputExistentAndFolderOrFile(source)) {
                    isInputValid = false
                } else {
                    if (!isInputValidFolderOrAnyFile(source, canInputContainFolders)) {
                        isInputValid = false
                    }
                }
            }
            return isInputValid
        }

        /**
         * Returns list of all elements in input array.
         * If element in array is a path to a folder, all child elements are added to the list.
         */
        fun getFileListFromValidatedResourceArray(inputResources: Array<File>): MutableList<File> {
            val resultList = mutableListOf<File>()
            for (source in inputResources) {
                resultList.addAll(getFilesInFolder(source))
            }
            return resultList
        }

        private fun getFilesInFolder(folder: File): List<File> {
            val files = folder.walk().filter { !it.name.startsWith(".") && !it.isDirectory }
            return files.toList()
        }
    }
}
