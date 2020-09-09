package de.maibornwolff.codecharta.importer.scmlogparser.parser

import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory

class VersionControlledFilesList(private val metricsFactory: MetricsFactory) {

    private var versionControlledFiles: MutableMap<String, VersionControlledFile> = mutableMapOf()

    /**
     * The key of the map is the current name
     * The value of the map is the oldest name
     */
    private var renamesMap: MutableMap<String, String> = mutableMapOf()

    /**
     * The key of the map is the current name
     * The value of the map is the number of name conflicts as a counter
     */
    private var nameConflictsMap: MutableMap<String, Int> = mutableMapOf()

    fun getBy(fileNameList: List<String>): MutableList<VersionControlledFile?> {
        var mappedFiles = mutableListOf<VersionControlledFile?>()
        fileNameList.forEach {
            mappedFiles.add(get(it))
        }
        return mappedFiles
    }

    fun get(key: String): VersionControlledFile? {
        return versionControlledFiles[resolveFileKey(key)]
    }

    fun addFileBy(key: String): VersionControlledFile {
        val vcf = VersionControlledFile(buildPossibleConflictName(key), metricsFactory)
        vcf.addRename(key)

        versionControlledFiles[resolveFileKey(key)] = vcf
        return vcf
    }

    /**
     * @TODO Decorate MutableMap instead of returning the internal list
     * @Deprecated since now
     */
    fun getList(): MutableMap<String, VersionControlledFile> {
        return versionControlledFiles
    }

    fun rename(oldFileName: String, newFileName: String) {
        var newVCFFileName = newFileName
        val possibleConflictName = buildPossibleConflictName(oldFileName) //newFileName?
        val oldestName = retrieveOldestName(possibleConflictName)

        if (versionControlledFiles.containsKey(newFileName) && !get(oldFileName)!!.containsRename(newFileName)) {
            val marker = nameConflictsMap[newFileName]
            val newMarker = if (marker != null) marker + 1 else 0
            newVCFFileName = newFileName + "_\\0_" + newMarker
            nameConflictsMap[newFileName] = newMarker
        }

        if (oldestName != null) {
            renamesMap.remove(possibleConflictName)
            renamesMap[newVCFFileName] = oldestName
            get(oldestName)!!.addRename(newVCFFileName)
            get(oldestName)!!.filename = newFileName
        } else {
            renamesMap[newVCFFileName] = oldFileName
            get(oldFileName)!!.addRename(newVCFFileName)
            get(oldFileName)!!.filename = newFileName
        }
    }

    private fun resolveFileKey(trackName: String): String {
        val possibleConflictName = buildPossibleConflictName(trackName)

        val oldestName = retrieveOldestName(possibleConflictName)

        return if (oldestName == null) possibleConflictName else oldestName
    }

    /**
     * If file name has already existed before, created new "salted" name to keep track of both files separately.
     */
    fun buildPossibleConflictName(trackName: String): String {
        if (nameConflictsMap.containsKey(trackName)) {
            return trackName + "_\\0_" + nameConflictsMap[trackName]
        }

        return trackName
    }

    private fun retrieveOldestName(possibleConflictName: String): String? {
        return renamesMap[possibleConflictName]
    }
}