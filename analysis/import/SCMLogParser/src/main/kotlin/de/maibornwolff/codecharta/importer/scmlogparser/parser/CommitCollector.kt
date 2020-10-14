package de.maibornwolff.codecharta.importer.scmlogparser.parser

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import java.util.stream.Collector

internal class CommitCollector private constructor(private val metricsFactory: MetricsFactory) {

    private fun collectCommit(versionControlledFiles: MutableList<VersionControlledFile>, commit: Commit) {
        if (commit.isEmpty) {
            return
        }
        addYetUnknownFilesToVersionControlledFiles(versionControlledFiles, commit.filenames)
        addCommitMetadataToMatchingVersionControlledFiles(commit, versionControlledFiles)
    }

    private fun addYetUnknownFilesToVersionControlledFiles(
        versionControlledFiles: MutableList<VersionControlledFile>,
        filenamesOfCommit: List<String>
    ) {
        filenamesOfCommit
            .filter { !versionControlledFilesContainsFile(versionControlledFiles, it) }
            .forEach { addYetUnknownFile(versionControlledFiles, it) }
    }

    private fun versionControlledFilesContainsFile(
        versionControlledFiles: List<VersionControlledFile>,
        filename: String
    ): Boolean {
        return findVersionControlledFileByFilename(versionControlledFiles, filename) != null
    }

    private fun findVersionControlledFileByFilename(
        versionControlledFiles: List<VersionControlledFile>,
        filename: String
    ): VersionControlledFile? {
        return versionControlledFiles.firstOrNull { it.filename == filename }
    }

    private fun addYetUnknownFile(
        versionControlledFiles: MutableList<VersionControlledFile>,
        filenameOfYetUnversionedFile: String
    ): Boolean {
        val missingVersionControlledFile = VersionControlledFile(filenameOfYetUnversionedFile, metricsFactory)
        return versionControlledFiles.add(missingVersionControlledFile)
    }

    private fun addCommitMetadataToMatchingVersionControlledFiles(
        commit: Commit,
        versionControlledFiles: List<VersionControlledFile>
    ) {
        commit.filenames.mapNotNull { findVersionControlledFileByFilename(versionControlledFiles, it) }
            .forEach { it.registerCommit(commit) }
    }

    companion object {

        fun create(metricsFactory: MetricsFactory): Collector<Commit, *, MutableList<VersionControlledFile>> {
            val collector = CommitCollector(metricsFactory)
            return Collector.of(
                { ArrayList() },
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
