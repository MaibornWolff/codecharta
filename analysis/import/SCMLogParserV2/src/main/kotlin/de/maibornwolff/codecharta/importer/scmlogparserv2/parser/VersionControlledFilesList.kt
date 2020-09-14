package de.maibornwolff.codecharta.importer.scmlogparserv2.parser

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics.MetricsFactory

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

    fun get(key: String): VersionControlledFile? {
        return versionControlledFiles[resolveFileKey(key)]
    }

    fun addFileBy(key: String): VersionControlledFile {
        var newVCFFileName = key

        if (versionControlledFiles.containsKey(key) && !versionControlledFiles[key]!!.isDeleted()) {
            val marker = nameConflictsMap[key]
            val newMarker = if (marker != null) marker + 1 else 0
            newVCFFileName = key + "_\\0_" + newMarker
            nameConflictsMap[key] = newMarker
        }

        val vcf = VersionControlledFile(newVCFFileName, metricsFactory)
        vcf.addRename(newVCFFileName)

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

        if (
                versionControlledFiles.containsKey(newFileName) &&
                versionControlledFiles[newFileName]!!.isDeleted()
        ) {
            // Clear the corresponding maps for file which will be replaced
            renamesMap.remove(versionControlledFiles[newFileName]!!.filename)
            nameConflictsMap.remove(buildPossibleConflictName(newFileName))

            // Replace deleted file with new file which has been added now
            versionControlledFiles.remove(newFileName)
        }

        if (
                versionControlledFiles.containsKey(newFileName) &&
                !get(oldFileName)!!.containsRename(newFileName)
        ) {
            val marker = nameConflictsMap[newFileName]
            val newMarker = if (marker != null) marker + 1 else 0
            newVCFFileName = newFileName + "_\\0_" + newMarker
            nameConflictsMap[newFileName] = newMarker
        }

        if (oldestName != null) {
            renamesMap.remove(possibleConflictName)
            renamesMap[newVCFFileName] = oldestName

            versionControlledFiles[oldestName]!!.addRename(newVCFFileName)
            versionControlledFiles[oldestName]!!.filename = newFileName
        } else {
            renamesMap[newVCFFileName] = oldFileName

            val notYetRenamedFile = versionControlledFiles[oldFileName]!!
            notYetRenamedFile.addRename(newVCFFileName)
            notYetRenamedFile.filename = newFileName
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
    private fun buildPossibleConflictName(trackName: String): String {
        if (nameConflictsMap.containsKey(trackName)) {
            return trackName + "_\\0_" + nameConflictsMap[trackName]
        }

        return trackName
    }

    private fun retrieveOldestName(possibleConflictName: String): String? {
        return renamesMap[possibleConflictName]
    }
}