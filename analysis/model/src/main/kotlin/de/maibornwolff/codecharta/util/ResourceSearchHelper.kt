package de.maibornwolff.codecharta.util

import java.io.File
import java.nio.file.Paths

class ResourceSearchHelper {

    companion object {

        /**
         * Checks whether a resource contains one of the specified searchTokens. To check that, the given searchOperator is used.
         */
        fun isResourceFulfillingSearchOperatorPresent(resource: String, searchToken: List<String>, searchOperator: (String, List<String>) -> Boolean,
                                                      shouldOnlySearchCurrentDirectory: Boolean, resourceShouldBeFile: Boolean): Boolean {
            val trimmedResourceName = resource.trim()

            // Check if given resource is directly the searched object
            if (searchOperator(trimmedResourceName, searchToken)) {
                return true
            }

            val searchFile = getFileFromResourceName(trimmedResourceName)
            println("Did not find resource directly, scanning directory `${searchFile.absolutePath}` if applicable.")

            return isResourcePresentInDirectory(searchFile, searchToken, searchOperator, shouldOnlySearchCurrentDirectory, resourceShouldBeFile)
        }

        private fun getFileFromResourceName(resourceName: String): File {
            return if (resourceName == "") {
                File(Paths.get("").toAbsolutePath().toString())
            } else {
                File(resourceName)
            }
        }

        private fun isResourcePresentInDirectory(searchFile: File, searchToken: List<String>, searchOperator: (String, List<String>) -> Boolean,
                                                 shouldOnlySearchCurrentDirectory: Boolean, resourceShouldBeFile: Boolean): Boolean {
            var fileSearch = searchFile.walk()

            if (shouldOnlySearchCurrentDirectory) {
                fileSearch = fileSearch.maxDepth(1)
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

        fun doesStringEndWith(toBeChecked: String, searchToken: List<String>): Boolean {
            for (token in searchToken) {
                if (toBeChecked.endsWith(token)) {
                    return true
                }
            }
            return false
        }

        fun doStringsEqual(toBeChecked: String, searchToken: List<String>): Boolean {
            for (token in searchToken) {
                if (toBeChecked == token) {
                    return true
                }
            }
            return false
        }
    }
}
