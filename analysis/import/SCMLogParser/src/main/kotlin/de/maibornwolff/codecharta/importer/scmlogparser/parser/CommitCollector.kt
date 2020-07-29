package de.maibornwolff.codecharta.importer.scmlogparser.parser

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import java.util.function.BiConsumer
import java.util.function.BinaryOperator
import java.util.function.Supplier
import java.util.stream.Collector

internal class CommitCollector private constructor(private val metricsFactory: MetricsFactory) {

    //remember concrete history
    // is a file always added before it is modified? Modification.Type.ADD

    private var renamesMap: MutableMap<String, String> = mutableMapOf() // Map<CurrentName, OldestName>
    private var nameConflictsMap: MutableMap<String, Int> = mutableMapOf() //Map <CurrentName, NumberOfConflicts>
    private var commitsParsed: Int = 0

    // Map<String, VersionControlledFile> = [filename, versionControlledFiles.get(filename)]

    private fun collectCommit(versionControlledFiles: MutableMap<String, VersionControlledFile>, commit: Commit) {
        if (commit.isEmpty) {
            return
        }

        commit.modifications.forEach {
            renamesMap
            nameConflictsMap

            val trackName = if (it.oldFilename.isNotEmpty()) it.oldFilename else it.currentFilename
            var possibleConflictName: String = if (nameConflictsMap.containsKey(trackName)) {
                trackName + "_\\0_" + nameConflictsMap[trackName]
            } else {
                trackName
            }

            val renameName: String? = renamesMap[possibleConflictName] //current
            val VCFName: String? =
                if (renameName == null) possibleConflictName else renameName //do we have an entry?

            when (it.type) {
                Modification.Type.ADD -> {
                    val file: VersionControlledFile? =
                        versionControlledFiles[possibleConflictName] //does the file exist?
                    if (file == null) {
                        val missingVersionControlledFile =
                            VersionControlledFile(possibleConflictName, metricsFactory) // if not create a file
                        versionControlledFiles[possibleConflictName] =
                            missingVersionControlledFile // and add it to the list
                        missingVersionControlledFile.registerCommit(commit, it)
                    } else {
                        versionControlledFiles[VCFName]!!.registerCommit(commit, it)
                    }
                }
                Modification.Type.DELETE -> {
                    val filename = renamesMap[possibleConflictName]
                    versionControlledFiles.remove(if (filename == null) possibleConflictName else filename) //remove a deleted file from list
                    renamesMap.remove(possibleConflictName) // and remove its references in renames
                }
                Modification.Type.RENAME -> {

                    var newVCFFileName = it.currentFilename

                    if (versionControlledFiles.containsKey(it.currentFilename)) {//is the filename contained in vCF
                        val marker: Int? =
                            nameConflictsMap[it.currentFilename] //check if the file is already contained with a marker
                        val newMarker: Int =
                            if (marker != null) marker + 1 else 0 //increment the marker for further tracking

                        newVCFFileName =
                            it.currentFilename + "_\\0_" + newMarker // generate new vCF entry we work with it.currentFilename to preserve the string structure
                        nameConflictsMap[it.currentFilename] = newMarker
                    }
                    if (renameName != null) {
                        renamesMap.remove(possibleConflictName) //remove old entry
                        renamesMap[newVCFFileName] = renameName // insert new entry, tracking the current name
                    } else {
                        renamesMap[newVCFFileName] = it.oldFilename //add new entry
                    }
                    versionControlledFiles[VCFName]?.registerCommit(commit, it)
                }
                else -> versionControlledFiles[VCFName]?.registerCommit(commit, it)
            }

            if(commitsParsed == 195)
                println("Hey")
            commitsParsed++

        }
    }

    private fun combineForParallelExecution(
        firstCommits: MutableMap<String, VersionControlledFile>,
        secondCommits: MutableMap<String, VersionControlledFile>
    ): MutableMap<String, VersionControlledFile> {
        throw UnsupportedOperationException("parallel collection of commits not supported")
    }

    companion object {

        fun create(metricsFactory: MetricsFactory): Collector<Commit, *, MutableMap<String, VersionControlledFile>> {
            val collector = CommitCollector(metricsFactory)
            return Collector.of(Supplier<MutableMap<String, VersionControlledFile>> { mutableMapOf() },
                BiConsumer<MutableMap<String, VersionControlledFile>, Commit> { versionControlledFiles, commit ->
                    collector.collectCommit(versionControlledFiles, commit)
                }, BinaryOperator<MutableMap<String, VersionControlledFile>> { firstCommits, secondCommits ->
                    collector.combineForParallelExecution(firstCommits, secondCommits)
                })
        }
    }
}
