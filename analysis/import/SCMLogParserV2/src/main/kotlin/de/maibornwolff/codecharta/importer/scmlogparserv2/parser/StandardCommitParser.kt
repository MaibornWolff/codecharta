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

            when (it.type) {

                Modification.Type.ADD -> {
                    val file = versionControlledFilesList.get(trackName)
                    if (file != null && !file.isDeleted() && it.currentFilename == file.filename) {
                        versionControlledFilesList.get(trackName)!!.registerCommit(commit, it)
                    }
                    else{
                        val vcfToBeAddedOrReplaced = versionControlledFilesList.addFileBy(trackName)
                        it.markInitialAdd()
                        vcfToBeAddedOrReplaced.registerCommit(commit, it)
                    }
                }

                Modification.Type.DELETE -> {
                    // TODO registerCommit() needed? @Ruben do we want to track deleted and then reverted files as author and commit amount
                    versionControlledFilesList.get(trackName)!!.markDeleted()
                }

                Modification.Type.RENAME -> {
                    var fileToBeRenamed: VersionControlledFile? =
                        versionControlledFilesList.get(trackName) ?: return@forEach

                    fileToBeRenamed!!.registerCommit(commit, it)
                    versionControlledFilesList.rename(it.oldFilename, it.currentFilename)
                }

                else -> {
                    // TODO Do we have to register delete commits if a RENAME OR MODIFY commit follows? (refer line 52)

                    var file = versionControlledFilesList.get(trackName)
                    if (file == null) {
                        file = versionControlledFilesList.addFileBy(trackName)
                    }
                    file.registerCommit(commit, it)
                }
            }
        }
    }

}
