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

        if (hasNameConflict(key)) {
            newVCFFileName = handleNameConflict(key)
        }

        val vcf = VersionControlledFile(newVCFFileName, metricsFactory)

        versionControlledFiles[resolveFileKey(key)] = vcf
        return vcf
    }

    private fun hasNameConflict(key: String): Boolean {
        val vcf = versionControlledFiles[key]
        if (vcf != null) {
            return !vcf.isDeleted()
        }
        return false
    }

    private fun handleNameConflict(key: String): String {
        val marker = nameConflictsMap[key]
        val newMarker = if (marker != null) marker + 1 else 0
        nameConflictsMap[key] = newMarker

        return key + "_\\0_" + newMarker
    }

    fun getList(): MutableMap<String, VersionControlledFile> {
        return versionControlledFiles
    }

    fun rename(oldFileName: String, newFileName: String) {
        var newVCFFileName = newFileName
        val possibleConflictName = buildPossibleConflictName(oldFileName)
        val oldestName = retrieveOldestName(possibleConflictName)

        if (fileExistsAsDeleted(newFileName)) {
            handleDeletedFileReplacedByRenamedFile(newFileName)
        }

        if (versionControlledFiles.containsKey(newFileName) && !isCyclicRename(oldFileName, newFileName)) {
            newVCFFileName = handleNameConflict(newFileName)
        }

        if (oldestName != null) {
            renamesMap.remove(possibleConflictName)
        }

        val updatedOldestName = if (oldestName != null) oldestName else oldFileName
        renamesMap[newVCFFileName] = updatedOldestName

        val notYetRenamedFile = versionControlledFiles[updatedOldestName]!!
        notYetRenamedFile.addRename(newVCFFileName)
        notYetRenamedFile.filename = newFileName
    }

    // File A is called B then A again, this will mess up the currentFilename and oldFilename structure, therefore a special handling is needed
    private fun isCyclicRename(oldFileName: String, newFileName: String): Boolean {
        return get(oldFileName)!!.containsRename(newFileName)
    }

    private fun fileExistsAsDeleted(key: String): Boolean {
        val vcf = versionControlledFiles[key]
        if (vcf != null) {
            return vcf.isDeleted()
        }
        return false
    }

    private fun handleDeletedFileReplacedByRenamedFile(newFileName: String) {
        // Clear the corresponding maps for file which will be replaced
        renamesMap.remove(versionControlledFiles[newFileName]!!.filename)
        nameConflictsMap.remove(buildPossibleConflictName(newFileName))

        // Remove deleted file with new file which has been added now
        versionControlledFiles.remove(newFileName)
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
