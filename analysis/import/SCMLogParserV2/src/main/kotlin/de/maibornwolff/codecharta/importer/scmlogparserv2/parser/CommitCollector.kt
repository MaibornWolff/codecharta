package de.maibornwolff.codecharta.importer.scmlogparserv2.parser

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics.MetricsFactory
import java.util.function.BiConsumer
import java.util.function.BinaryOperator
import java.util.function.Supplier
import java.util.stream.Collector

internal class CommitCollector {

    var commitParsers = listOf<CommitParser>(StandardCommitParser(), MergeCommitParser())

    private fun collectCommit(versionControlledFilesList: VersionControlledFilesList, commit: Commit) {
        commitParsers.forEach {
            if (it.canParse(commit)) {
                it.parse(commit, versionControlledFilesList)
                return
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
