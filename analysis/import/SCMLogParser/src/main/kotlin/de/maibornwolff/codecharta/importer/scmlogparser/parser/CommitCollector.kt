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

    private var renamesMap: MutableMap<String, String> = mutableMapOf() // Map<CurrentName, OldestName>
    private var nameConflictsMap: MutableMap<String, Int> = mutableMapOf() // Map <CurrentName, NumberOfConflicts>

    private fun collectCommit(versionControlledFiles: MutableMap<String, VersionControlledFile>, commit: Commit) {
        if (commit.isEmpty) {
            return
        }

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
                    val file = versionControlledFiles[possibleConflictName]
                    if (file == null) {
                        val missingVersionControlledFile = VersionControlledFile(possibleConflictName, metricsFactory)
                        versionControlledFiles[possibleConflictName] = missingVersionControlledFile
                        missingVersionControlledFile.registerCommit(commit, it)
                    } else {
                        versionControlledFiles[VCFName]!!.registerCommit(commit, it)
                    }
                }

                Modification.Type.DELETE -> {
                    val filename = renamesMap[possibleConflictName]
                    versionControlledFiles.remove(if (filename == null) possibleConflictName else filename)
                    renamesMap.remove(possibleConflictName)

                }
                Modification.Type.RENAME -> {
                    var newVCFFileName = it.currentFilename
                    if (versionControlledFiles.containsKey(it.currentFilename)) {
                        val marker = nameConflictsMap[it.currentFilename]
                        val newMarker = if (marker != null) marker + 1 else 0
                        newVCFFileName = it.currentFilename + "_\\0_" + newMarker
                        nameConflictsMap[it.currentFilename] = newMarker
                    }
                    if (oldestName != null) {
                        renamesMap.remove(possibleConflictName)
                        renamesMap[newVCFFileName] = oldestName
                    } else {
                        renamesMap[newVCFFileName] = it.oldFilename
                    }
                    versionControlledFiles[VCFName]?.filename = it.currentFilename
                    versionControlledFiles[VCFName]?.registerCommit(commit, it)
                }
                else -> versionControlledFiles[VCFName]?.registerCommit(commit, it)
            }
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
