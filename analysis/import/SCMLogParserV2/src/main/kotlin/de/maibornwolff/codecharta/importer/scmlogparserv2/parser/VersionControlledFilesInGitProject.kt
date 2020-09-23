package de.maibornwolff.codecharta.importer.scmlogparserv2.parser

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.VersionControlledFile

class VersionControlledFilesInGitProject(private val vcFList :MutableMap<String, VersionControlledFile>, private val filesInGitLog: List<String>) {

    fun removeSaltFromFilenames(){
        vcFList.values
            .forEach {
                it.filename = it.filename.substringBefore("_\\0_")
            }
    }

    private fun findDuplicates() : MutableMap<String, Set<String>>{
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

    private fun removeDuplicates(trackingNamesPerFilename : MutableMap<String, Set<String>>){
        trackingNamesPerFilename.keys.forEach { elem ->
            var choosenElement = ""
            trackingNamesPerFilename[elem]?.forEach {
                if (!vcFList[it]?.isDeleted()!!) {
                    choosenElement = it
                }
            }
            if (choosenElement == "") {
                choosenElement = trackingNamesPerFilename[elem]?.last().toString()
            }

            trackingNamesPerFilename[elem]?.forEach {
                if (it != choosenElement)
                    vcFList.remove(it)
            }
        }
    }

    fun getListOfVCFilesMatchingGitProject() : List<VersionControlledFile>{

        removeSaltFromFilenames()
        val trackingNamesPerFilename = findDuplicates()
        removeDuplicates(trackingNamesPerFilename)

     return  vcFList.values
            .filter { filesInGitLog.contains(it.filename) }
    }




}