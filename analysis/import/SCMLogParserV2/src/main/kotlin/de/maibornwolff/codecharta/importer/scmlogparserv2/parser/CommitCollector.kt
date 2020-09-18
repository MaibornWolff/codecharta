package de.maibornwolff.codecharta.importer.scmlogparserv2.parser

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics.MetricsFactory
import java.util.function.BiConsumer
import java.util.function.BinaryOperator
import java.util.function.Supplier
import java.util.stream.Collector

internal class CommitCollector {

    private var commitNumber = 0

    private fun collectCommit(versionControlledFilesList: VersionControlledFilesList, commit: Commit) {
        if (commit.isEmpty) {
            return
        }
        commitNumber += 1

        if (commit.isMergeCommit()) {
            return handleMergeCommit(commit, versionControlledFilesList)
        }

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

    private fun handleMergeCommit(commit: Commit, versionControlledFilesList: VersionControlledFilesList) {

        commit.modifications.forEach {
            val file = versionControlledFilesList.get(it.getTrackName())
            if (file == null || !file.isMutated()) {
                // Handle mutated files only when a merge commit occurs
                return
            }

            if (file.isDeleted() && it.isTypeAdd()) {
                file.unmarkDeleted()
                file.resetMutation()
            } else if (file.isDeleted() && it.isTypeDelete()) {
                file.resetMutation()
            } else if (it.isTypeModify()) {
                // Add -> Add -> Merge both files will result in Modify
                file.resetMutation()
            } else if (it.isTypeDelete()) {
                // Add -> Add -> Merge files: delete one will result in Delete
                file.resetMutation()
            } else if (it.isTypeAdd()) {
                // Do not handle redundant Add modifications for the same file.
                // Why is this happening?
            } else {
                System.err.println(
                    "\nUnhandled Edge Case in MergeCommit: deleted: %s, mutated: %s, modification type: %s, initalAdd: %s, file: %s"
                        .format(file.isDeleted(), file.isMutated(), it.type, it.isInitialAdd(), file.filename)
                )
            }
        }
    }

    private fun combineForParallelExecution(
        firstCommits: VersionControlledFilesList,
        secondCommits: VersionControlledFilesList
    ): VersionControlledFilesList {
        throw UnsupportedOperationException("parallel collection of commits not supported")
    }

    companion object {

        fun create(metricsFactory: MetricsFactory): Collector<Commit, *, VersionControlledFilesList> {
            val collector = CommitCollector()

            return Collector.of(
                Supplier<VersionControlledFilesList> { VersionControlledFilesList(metricsFactory) },
                BiConsumer<VersionControlledFilesList, Commit> { versionControlledFiles,
                    commit ->
                    collector.collectCommit(versionControlledFiles, commit)
                },
                BinaryOperator<VersionControlledFilesList> { firstCommits,
                    secondCommits ->
                    collector.combineForParallelExecution(firstCommits, secondCommits)
                }
            )
        }
    }
}
