package de.maibornwolff.codecharta.importer.scmlogparser.parser;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collector;

class CommitCollector {

    private final MetricsFactory metricsFactory;

    private CommitCollector(MetricsFactory metricsFactory) {
        this.metricsFactory = metricsFactory;
    }

    static Collector<Commit, ?, List<VersionControlledFile>> create(MetricsFactory metricsFactory) {
        CommitCollector collector = new CommitCollector(metricsFactory);
        return Collector.of(ArrayList::new, collector::collectCommit, collector::combineForParallelExecution);
    }

    private void collectCommit(List<VersionControlledFile> versionControlledFiles, Commit commit) {
        if (commit.isEmpty()) {
            return;
        }
        addYetUnknownFilesToVersionControlledFiles(versionControlledFiles, commit.getFilenames());
        addCommitMetadataToMatchingVersionControlledFiles(commit, versionControlledFiles);
    }

    private void addYetUnknownFilesToVersionControlledFiles(List<VersionControlledFile> versionControlledFiles, List<String> filenamesOfCommit) {
        filenamesOfCommit.stream()
                .filter(filename -> !versionControlledFilesContainsFile(versionControlledFiles, filename))
                .forEach(unknownFilename -> addYetUnknownFile(versionControlledFiles, unknownFilename));
    }

    private boolean versionControlledFilesContainsFile(List<VersionControlledFile> versionControlledFiles, String filename) {
        return findVersionControlledFileByFilename(versionControlledFiles, filename).isPresent();
    }

    private Optional<VersionControlledFile> findVersionControlledFileByFilename(List<VersionControlledFile> versionControlledFiles, String filename) {
        return versionControlledFiles.stream()
                .filter(commit -> commit.getFilename().equals(filename))
                .findFirst();
    }

    private boolean addYetUnknownFile(List<VersionControlledFile> versionControlledFiles, String filenameOfYetUnversionedFile) {
        VersionControlledFile missingVersionControlledFile = new VersionControlledFile(filenameOfYetUnversionedFile, metricsFactory);
        return versionControlledFiles.add(missingVersionControlledFile);
    }

    private void addCommitMetadataToMatchingVersionControlledFiles(Commit commit, List<VersionControlledFile> versionControlledFiles) {
        commit.getFilenames().stream()
                .map(file -> findVersionControlledFileByFilename(versionControlledFiles, file))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .forEach(vcFile -> vcFile.registerCommit(commit));

    }

    private List<VersionControlledFile> combineForParallelExecution(List<VersionControlledFile> firstCommits, List<VersionControlledFile> secondCommits) {
        throw new UnsupportedOperationException("parallel collection of commits not supported");
    }

}
