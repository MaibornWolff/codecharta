package de.maibornwolff.codecharta.importer.scmlogparser.parser

import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile

class VersionControlledFilesList {

    private var versionControlledFiles: MutableMap<String, VersionControlledFile> = mutableMapOf();

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

    fun add(key: String, versionControlledFile: VersionControlledFile) {
        versionControlledFiles[resolveFileKey(key)] = versionControlledFile
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
        val possibleConflictName = buildPossibleConflictName(newFileName)
        val oldestName = retrieveOldestName(possibleConflictName)

        if (versionControlledFiles.containsKey(newFileName)) {
            val marker = nameConflictsMap[newFileName]
            val newMarker = if (marker != null) marker + 1 else 0
            newVCFFileName = newFileName + "_\\0_" + newMarker
            nameConflictsMap[newFileName] = newMarker
        }

        if (oldestName != null) {
            renamesMap.remove(possibleConflictName)
            renamesMap[newVCFFileName] = oldestName

            // this will be done in ADD case later
            //versionControlledFiles[oldestName]!!.unmarkDeleted()
        } else {
            renamesMap[newVCFFileName] = oldFileName

            //TODO Might be done by VCF Class internally (registerCommit method)
            //versionControlledFiles[it.oldFilename]!!.unmarkDeleted()
        }

        get(resolveFileKey(oldFileName))!!.filename = newFileName
    }

    private fun resolveFileKey(trackName: String): String {
        val possibleConflictName = buildPossibleConflictName(trackName)

        val oldestName = retrieveOldestName(possibleConflictName)

        return if (oldestName == null) possibleConflictName else oldestName
    }

    /**
     * If file name has already existed before, created new "salted" name
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