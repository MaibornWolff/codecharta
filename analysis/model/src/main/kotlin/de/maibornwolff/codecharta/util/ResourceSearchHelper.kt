package de.maibornwolff.codecharta.util

import java.io.File
import java.nio.file.Paths

class ResourceSearchHelper {

    companion object {
        fun isResourcePresent(resourceName: String, searchToken: String, searchOperator: (String, String) -> Boolean,
                              maxSearchingDepth: Int, shouldSearchFullDirectory: Boolean, resourceShouldBeFile: Boolean): Boolean {
            val trimmedResourceName = resourceName.trim()
            if (searchOperator(trimmedResourceName, searchToken)) {
                return true
            }

            val searchFile = getFileFromResourceName(trimmedResourceName)

            return isResourcePresentInDirectory(searchFile, searchToken, searchOperator, maxSearchingDepth, shouldSearchFullDirectory, resourceShouldBeFile)
        }

        fun doesStringEndWith(toBeCheckedString: String, searchToken: String): Boolean {
            return (toBeCheckedString.endsWith(searchToken))
        }

        fun doStringsEqual(string1: String, string2: String): Boolean {
            return (string1 == string2)
        }

        private fun getFileFromResourceName(resourceName: String): File {
            return if (resourceName == "") {
                File(Paths.get("").toAbsolutePath().toString())
            } else {
                File(resourceName)
            }
        }

        private fun isResourcePresentInDirectory(searchFile: File, searchToken: String, searchOperator: (String, String) -> Boolean,
                                                 maxSearchingDepth: Int, shouldSearchFullDirectory: Boolean, resourceShouldBeFile: Boolean): Boolean {
            var fileSearch = searchFile.walk()

            if (!shouldSearchFullDirectory) {
                fileSearch = fileSearch.maxDepth(maxSearchingDepth)
            }

            return if (resourceShouldBeFile) {
                fileSearch.asSequence()
                        .filter { it.isFile }
                        .map { it.name }
                        .filter { searchOperator(it, searchToken) }
                        .any()
            } else {
                fileSearch.asSequence()
                        .map { it.name }
                        .filter { searchOperator(it, searchToken) }
                        .any()
            }
        }
    }
}
