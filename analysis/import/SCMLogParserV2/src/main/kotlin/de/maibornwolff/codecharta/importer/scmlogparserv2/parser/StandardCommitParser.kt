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

            // Registers each modification for a given commit, performing different actions depending on the type
            // to preserve uniqueness a marker is added to the name, following a marker_\\0_marker scheme, for tracking in the map
            // TODO @vladimir: Do we still need the comments?
            // Type.ADD: creates a new VCF file, if it doesn't exist, adds it to the VCF map and registers adding
            // Type.DELETE: selects the tracking name and deletes the file from the VCF map, and rename map if needed
            // Type.RENAME: Checks for potential rename conflicts and increments the tracking pointer if one is found
            // -> creates a new rename entry or updates the key to the current name used to track the oldest file name
            // Type.MODIFY/Type.UNKNOWN: simply registers this modification for the commit
            val trackName = it.getTrackName()

            when (it.type) {

                Modification.Type.ADD -> {

                    // Add new File
                    val file = versionControlledFilesList.get(trackName)

                    if (file == null) {
                        val missingVCF = versionControlledFilesList.addFileBy(trackName)
                        it.markInitialAdd()
                        missingVCF.registerCommit(commit, it)
                    } else {
                        if (!file.isDeleted()) {
                            if (it.currentFilename != file.filename) {
                                val newVCF = versionControlledFilesList.addFileBy(trackName)
                                it.markInitialAdd()
                                newVCF.registerCommit(commit, it)
                            } else {
                                versionControlledFilesList.get(trackName)!!.registerCommit(commit, it)
                            }
                        }
                        if (file.isDeleted()) {

                            // If a file is deleted and a new one with same name is added, replace deleted one.
                            val replacingVCF = versionControlledFilesList.addFileBy(trackName)
                            it.markInitialAdd()
                            replacingVCF.registerCommit(commit, it)
                        }
                    }
                }

                Modification.Type.DELETE -> {
                    // TODO registerCommit() needed?
                    // TODO It might be a good idea to skip deletes for non-existing files

                    versionControlledFilesList.get(trackName)!!.markDeleted()
                }

                Modification.Type.RENAME -> {
                    var fileToBeRenamed: VersionControlledFile? =
                        versionControlledFilesList.get(trackName) ?: return@forEach

                    fileToBeRenamed!!.registerCommit(commit, it)
                    versionControlledFilesList.rename(it.oldFilename, it.currentFilename)
                }

                else -> {
                    // TODO Do we have to register delete commits if a RENAME OR MODIFY commit follows?
                    // TODO consider DElTA Mode and Edge calculation

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
