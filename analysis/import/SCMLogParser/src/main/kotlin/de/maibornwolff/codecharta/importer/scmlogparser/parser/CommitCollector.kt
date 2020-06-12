package de.maibornwolff.codecharta.importer.scmlogparser.parser

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import java.util.*
import java.util.function.BiConsumer
import java.util.function.BinaryOperator
import java.util.function.Supplier
import java.util.stream.Collector

internal class CommitCollector private constructor(private val metricsFactory: MetricsFactory) {
    private fun collectCommit(versionControlledFiles: MutableList<VersionControlledFile>, commit: Commit) {
        if (commit.isEmpty) {
            return
        }

        for (fileName in commit.filenames) {
            var versionControlledFile: VersionControlledFile? =
                versionControlledFiles.firstOrNull { it.filename == fileName }
            if (versionControlledFile == null) {
                val missingVersionControlledFile = VersionControlledFile(fileName, metricsFactory)
                versionControlledFiles.add(missingVersionControlledFile)
                missingVersionControlledFile.registerCommit(commit)
            } else {
                versionControlledFile.registerCommit(commit)
            }
        }
    }

    private fun combineForParallelExecution(
        firstCommits: MutableList<VersionControlledFile>,
        secondCommits: MutableList<VersionControlledFile>
    ): MutableList<VersionControlledFile> {
        throw UnsupportedOperationException("parallel collection of commits not supported")
    }

    companion object {
        fun create(metricsFactory: MetricsFactory): Collector<Commit, *, MutableList<VersionControlledFile>> {
            val collector = CommitCollector(metricsFactory)
            return Collector.of(Supplier<MutableList<VersionControlledFile>> { ArrayList() },
                BiConsumer<MutableList<VersionControlledFile>, Commit> { versionControlledFiles, commit ->
                    collector.collectCommit(versionControlledFiles, commit)
                }, BinaryOperator<MutableList<VersionControlledFile>> { firstCommits, secondCommits ->
                    collector.combineForParallelExecution(firstCommits, secondCommits)
                })
        }
    }
}
