package de.maibornwolff.codecharta.importer.scmlogparser.parser

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import java.lang.NullPointerException
import java.util.function.BiConsumer
import java.util.function.BinaryOperator
import java.util.function.Supplier
import java.util.stream.Collector

internal class CommitCollector private constructor(private val metricsFactory: MetricsFactory) {

    private var renamesMap: MutableMap<String, String> = mutableMapOf() // Map<CurrentName, OldestName>
    private var nameConflictsMap: MutableMap<String, Int> = mutableMapOf() // Map <CurrentName, NumberOfConflicts>
    private var commitNumber = 0

    private fun collectCommit(versionControlledFilesList: VersionControlledFilesList, commit: Commit) {
        if (commit.isEmpty) {
            return
        }
        commitNumber += 1

        //@TODO (in progress) make this happen! :)
        //        if (commit.isMergeCommit() && versionControlledFiles.affectedByMergeCommit(commit.modifications)) {
        //            commit.modifications
        //        }

        commit.modifications.forEach {

            //Registers each modification for a given commit, performing different actions depending on the type
            //to preserve uniqueness a marker is added to the name, following a marker_\\0_marker scheme, for tracking in the map
            //
            //Type.ADD: creates a new VCF file, if it doesn't exist, adds it to the VCF map and registers adding
            //Type.DELETE: selects the tracking name and deletes the file from the VCF map, and rename map if needed
            //Type.RENAME: Checks for potential rename conflicts and increments the tracking pointer if one is found
            // -> creates a new rename entry or updates the key to the current name used to track the oldest file name
            //Type.MODIFY/Type.UNKNOWN: simply registers this modification for the commit
            val trackName = if (it.oldFilename.isNotEmpty()) it.oldFilename else it.currentFilename
            val possibleConflictName =
                    if (nameConflictsMap.containsKey(trackName)) {
                        trackName + "_\\0_" + nameConflictsMap[trackName]
                    } else {
                        trackName
                    }

            val oldestName = renamesMap[possibleConflictName]
            val VCFName = if (oldestName == null) possibleConflictName else oldestName

            when (it.type) {

                Modification.Type.ADD -> {
                    // Add new File
                    val file = versionControlledFilesList.get(trackName)
                    if (file == null) {
                        val missingVersionControlledFile = VersionControlledFile(possibleConflictName, metricsFactory)
                        versionControlledFilesList.add(trackName, missingVersionControlledFile)
                        missingVersionControlledFile.registerCommit(commit, it)
                    } else {
                        // Add for existing not deleted file
                        // is deleted for sure
                        if (!file.isDeleted()) {
                            versionControlledFilesList.get(trackName)!!.registerCommit(commit, it)
                        }

                        // Add for existing deleted file
                        // unmark delete
                        if (file.isDeleted()) {
                            file.unmarkDeleted()
                            //TODO Do we need to register a commit in this case? No :)
                        }
                    }
                }

                Modification.Type.DELETE -> {
                    try {
                        versionControlledFilesList.get(trackName)!!.markDeleted()
                    } catch (exc: NullPointerException) {
                        exc.message;
                        println(exc.message);
                    }
                    //renamesMap.remove(possibleConflictName)
                }
                Modification.Type.RENAME -> {

                    versionControlledFilesList.rename(it.oldFilename, it.currentFilename)

                    /*                    var newVCFFileName = it.currentFilename
                                        //TODO WHAT if the new name is assigned to an existing and deleted VCF
                                        //TODO conflict logic should be able to handle that conflict.
                                        if (versionControlledFiles.containsKey(it.currentFilename)) {
                                            val marker = nameConflictsMap[it.currentFilename]
                                            val newMarker = if (marker != null) marker + 1 else 0
                                            newVCFFileName = it.currentFilename + "_\\0_" + newMarker
                                            nameConflictsMap[it.currentFilename] = newMarker
                                        }
                                        if (oldestName != null) {
                                            renamesMap.remove(possibleConflictName)
                                            renamesMap[newVCFFileName] = oldestName

                                            // this will be done in ADD case later
                                            //versionControlledFiles[oldestName]!!.unmarkDeleted()
                                        } else {
                                            renamesMap[newVCFFileName] = it.oldFilename

                                            //TODO Might be done by VCF Class internally (registerCommit method)
                                            //versionControlledFiles[it.oldFilename]!!.unmarkDeleted()
                                        }
                     */

                    //versionControlledFilesList.get(trackName)!!.filename = it.currentFilename
                    versionControlledFilesList.get(trackName)!!.registerCommit(commit, it)
                }
                else                     -> {
                    //TODO Never delete a file from versionControlFiles list
                    //TODO Mark deleted file as deleted.
                    //TODO Unmark deleted file if RENAME or MODIFY appears and registerCommit.

                    //TODO ENSURE to filter deleted files from being exported in a cc.json file.

                    //TODO If a file is (deleted) and added later with the same name,
                    //TODO a deletion is correct and the metrics must be start at 0. (existing conflict handling)
                    //TODO Do we have to register delete commits if a RENAME OR MODIFY commit follows?
                    //TODO consider DElTA Mode and Edge calculation
                    //versionControlledFiles[VCFName]!!.unmarkDeleted()

                    versionControlledFilesList.get(trackName)!!.registerCommit(commit, it)
                }

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
            val collector = CommitCollector(metricsFactory)

            return Collector.of(
                    Supplier<VersionControlledFilesList> { VersionControlledFilesList() },
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
