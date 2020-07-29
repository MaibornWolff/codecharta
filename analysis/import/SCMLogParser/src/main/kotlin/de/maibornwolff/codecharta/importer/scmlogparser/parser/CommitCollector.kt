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

            val trackName = if (it.oldFilename.isNotEmpty()) it.oldFilename else it.currentFilename
            val possibleConflictName =
                if (nameConflictsMap.containsKey(trackName)) {
                    trackName + "_\\0_" + nameConflictsMap[trackName]
                } else {
                    trackName
                }

            val renameName = renamesMap[possibleConflictName]
            val VCFName = if (renameName == null) possibleConflictName else renameName

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
                    if (renameName != null) {
                        renamesMap.remove(possibleConflictName)
                        renamesMap[newVCFFileName] = renameName
                    } else {
                        renamesMap[newVCFFileName] = it.oldFilename
                    }
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
