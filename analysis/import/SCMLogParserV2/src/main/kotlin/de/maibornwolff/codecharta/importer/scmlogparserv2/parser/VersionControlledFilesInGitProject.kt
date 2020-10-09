package de.maibornwolff.codecharta.importer.scmlogparserv2.parser

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.VersionControlledFile

class VersionControlledFilesInGitProject(private val vcFList: MutableMap<String, VersionControlledFile>, private val filesInGitLog: List<String>) {

    //TODO salts should not be part of filenames, change logic error
    private fun removeSaltFromFilenames() {
        vcFList.values
            .forEach {
                it.filename = it.filename.substringBefore("_\\0_")
            }
    }

    private fun findDuplicates(): MutableMap<String, Set<String>> {
        val occurrencesPerFilename = vcFList.values.groupingBy { it.filename }.eachCount()

        val duplicateFilenames = occurrencesPerFilename.filterValues { it > 1 }

        val trackingNamesPerFilename = mutableMapOf<String, Set<String>>()
        duplicateFilenames.keys.forEach { element ->
            trackingNamesPerFilename[element] = vcFList.keys.filter {
                vcFList[it]?.filename == element
            }.toSet()
        }
        return trackingNamesPerFilename
    }

    //We always keep deleted files until the end, because they might be re-added in a merge commit
    //This might result in multiple files with the same filename being stored in VCF
    //the following function tries to find the correct version to keep for later visualization, by accounting for flags and time of addition
    private fun removeDuplicates(trackingNamesPerFilename: MutableMap<String, Set<String>>) {
        trackingNamesPerFilename.keys.forEach { elem ->
            var chooseElement = ""
            trackingNamesPerFilename[elem]?.forEach {
                if (!vcFList[it]?.isDeleted()!!) {
                    chooseElement = it
                }
            }
            if (chooseElement == "") {
                chooseElement = trackingNamesPerFilename[elem]?.last().toString()
            }

            trackingNamesPerFilename[elem]?.forEach {
                if (it != chooseElement)
                    vcFList.remove(it)
            }
        }
    }

    fun getListOfVCFilesMatchingGitProject(): Set<VersionControlledFile> {

        removeSaltFromFilenames()
        val trackingNamesPerFilename = findDuplicates()
        removeDuplicates(trackingNamesPerFilename)

        return vcFList.values
            .filter { filesInGitLog.contains(it.filename) }.toSet()
    }
}
