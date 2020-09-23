package de.maibornwolff.codecharta.importer.scmlogparserv2.parser

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics.MetricsFactory
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

    companion object {

        fun create(metricsFactory: MetricsFactory): Collector<Commit, *, VersionControlledFilesList> {
            val collector = CommitCollector()

            return Collector.of(
                { VersionControlledFilesList(metricsFactory) },
                { versionControlledFiles,
                    commit ->
                    collector.collectCommit(versionControlledFiles, commit)
                },
                { _, _ ->
                    throw UnsupportedOperationException("parallel collection of commits not supported")
                }
            )
        }
    }
}
