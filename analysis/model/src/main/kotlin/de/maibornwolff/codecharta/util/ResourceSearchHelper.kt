package de.maibornwolff.codecharta.util

import java.io.File

class ResourceSearchHelper {

    companion object {
        fun isResourcePresent(resourceName: String, searchToken: String, searchOperator: (String, String) -> Boolean,
                              maxSearchingDepth: Int, shouldSearchFullDirectory: Boolean, resourceShouldBeFile: Boolean): Boolean {
            val trimmedResourceName = resourceName.trim()

            if (trimmedResourceName == "") {
                return false
            }

            // To be able to generally search for the existence of files, do not check empty string here,
            // otherwise the real check never gets executed.
            if (searchOperator(trimmedResourceName, searchToken) && searchToken != "") {
                return true
            }

            val searchFile = File(trimmedResourceName)

            return isResourcePresentInDirectory(searchFile, searchToken, searchOperator, maxSearchingDepth, shouldSearchFullDirectory, resourceShouldBeFile)
        }

        fun doesStringEndWith(toBeCheckedString: String, searchToken: String): Boolean {
            return (toBeCheckedString.endsWith(searchToken))
        }

        fun doStringsEqual(string1: String, string2: String): Boolean {
            return (string1 == string2)
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
