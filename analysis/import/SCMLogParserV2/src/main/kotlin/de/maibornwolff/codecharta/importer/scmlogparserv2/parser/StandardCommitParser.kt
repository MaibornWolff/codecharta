package de.maibornwolff.codecharta.importer.scmlogparserv2.parser

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.VersionControlledFile

class StandardCommitParser : CommitParser {

    override fun canParse(commit: Commit): Boolean {
        return !commit.isEmpty && !commit.isMergeCommit()
    }

    override fun parse(commit: Commit, versionControlledFilesList: VersionControlledFilesList) {
        commit.modifications.forEach {
            if (it.currentFilename.isEmpty()) return@forEach

            val trackName = it.getTrackName()

            // The parser works with different filenames
            // currentFilename : the current filename of the file in modification, might differ from the original in case of a rename, this will set oldFilename as well
            //file.filename: the filename of a given file at this instance, will later be displayed in the visualization
            // trackName: the key used to find files, corresponds to the files name at its first occurrence, might be salted using _//0_number in case of the spot being already taken

            when (it.type) {

                Modification.Type.ADD -> {
                    handleAddModification(versionControlledFilesList, trackName, commit, it)
                }

                Modification.Type.DELETE -> {
                    handleDeleteModification(versionControlledFilesList, trackName)
                }

                Modification.Type.RENAME -> {
                    handleRenameModification(versionControlledFilesList, trackName, commit, it)
                }

                else -> {
                    handleModModification(versionControlledFilesList, trackName, commit, it)
                }
            }
        }
    }

    private fun handleAddModification(
        versionControlledFilesList: VersionControlledFilesList,
        trackName: String,
        commit: Commit,
        mod: Modification
    ) {
        val file = versionControlledFilesList.get(trackName)
        if (file != null && !file.isDeleted() && mod.currentFilename == file.filename) {
            file.registerCommit(commit, mod)
        } else {
            val vcfToBeAddedOrReplaced = versionControlledFilesList.addFileBy(trackName)
            mod.markInitialAdd()
            vcfToBeAddedOrReplaced.registerCommit(commit, mod)
        }
    }

    private fun handleDeleteModification(versionControlledFilesList: VersionControlledFilesList, trackName: String) {
        // TODO registerCommit() needed? @Ruben do we want to track deleted and then reverted files as author and commit amount
        versionControlledFilesList.get(trackName)!!.markDeleted()
    }

    private fun handleRenameModification(
        versionControlledFilesList: VersionControlledFilesList,
        trackName: String,
        commit: Commit,
        mod: Modification
    ) {
        var fileToBeRenamed: VersionControlledFile? =
            versionControlledFilesList.get(trackName)

        if (fileToBeRenamed != null) {
            fileToBeRenamed.registerCommit(commit, mod)
            versionControlledFilesList.rename(mod.oldFilename, mod.currentFilename)
        }
    }

    private fun handleModModification(
        versionControlledFilesList: VersionControlledFilesList,
        trackName: String,
        commit: Commit,
        mod: Modification
    ) {
        // TODO Do we have to register delete commits if a RENAME OR MODIFY commit follows? (refer line 33)

        var file = versionControlledFilesList.get(trackName)
        if (file == null) {
            file = versionControlledFilesList.addFileBy(trackName)
        }
        file.registerCommit(commit, mod)
    }
}
