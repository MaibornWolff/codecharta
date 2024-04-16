package de.maibornwolff.codecharta.util

import java.io.File

class InputHelper {
    companion object {
        /**
         * Checks the same as ´isInputValid(Array<File>, Boolean)`, but additionally checks for nullness in elements in array.
         */
        fun isInputValidAndNotNull(
        inputResources: Array<File?>,
                         canInputContainFolders: Boolean
        ): Boolean {
            val nonNullInputResources: Array<File>
            try {
                nonNullInputResources = inputResources.requireNoNulls()
            } catch (e: IllegalArgumentException) {
                Logger.logger.error { "Input contained illegal null resource!" }
                return false
            }

            return isInputValid(nonNullInputResources, canInputContainFolders)
        }

        /**
         * Checks if input resources meet a number of requirements:
         * The input array can not be empty.
         * If input can not contain folders, no element in the list can be a path to a folder.
         * All elements in the array have to either be existing files or if allowed, folders.
         */
        fun isInputValid(
        inputResources: Array<File>,
                         canInputContainFolders: Boolean
        ): Boolean {
            return !isInputEmpty(inputResources) &&
                   areInputResourcesValid(inputResources, canInputContainFolders)
        }

        private fun isInputEmpty(inputResources: Array<File>): Boolean {
            if (inputResources.isEmpty()) {
                Logger.logger.error { "Did not find any input resources!" }
                return true
            }
            return false
        }

        private fun isInputEmptyString(inputResource: File): Boolean {
            if (inputResource.name == "") {
                Logger.logger.error { "Input empty string for input files/folders, which is not allowed!" }
                return true
            }
            return false
        }

        private fun isInputExistentFolderOrFile(inputResource: File): Boolean {
            if (!(inputResource.isFile || inputResource.isDirectory)) {
                Logger.logger.error { "Could not find resource `${inputResource.path}`!" }
                return false
            }
            return true
        }

        private fun isInputValidFolderOrAnyFile(
        inputResource: File,
                                                canInputContainFolders: Boolean
        ): Boolean {
            if (canInputContainFolders) {
                if (inputResource.isDirectory && getFilesInFolder(inputResource).isEmpty()) {
                    Logger.logger.error { "The specified path `${inputResource.path}` exists but is empty!" }
                    return false
                }
                return true
            } else {
                if (inputResource.isDirectory) {
                    Logger.logger.error { "Input folder where only files are allowed!" }
                    return false
                }
                return true
            }
        }

        private fun areInputResourcesValid(
        inputResources: Array<File>,
                                           canInputContainFolders: Boolean
        ): Boolean {
            var isInputValid = true

            // We do not end/break early here, so user is informed about all input faults in one run
            for (source in inputResources) {
                if (isInputEmptyString(source)) {
                    isInputValid = false
                } else if (!isInputExistentFolderOrFile(source)) {
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
