package de.maibornwolff.codecharta.importer.scmlogparser.input;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class Commit {

    private final String author;

    private final List<Modification> modifications;

    private final OffsetDateTime commitDate;

    public Commit(String author, List<Modification> modifications, OffsetDateTime commitDate) {
        this.author = author;
        this.commitDate = commitDate;
        this.modifications = filterEmptyFiles(modifications);
    }

    private List<Modification> filterEmptyFiles(List<Modification> modifications) {
        return modifications.stream()
                .filter(m -> !m.getFilename().isEmpty())
                .collect(Collectors.toList());
    }

    public String getAuthor() {
        return author;
    }

    public List<String> getFilenames() {
        return modifications.stream().map(Modification::getFilename).collect(Collectors.toList());
    }


    public List<Modification> getModifications() {
        return modifications;
    }

    public Optional<Modification> getModification(String filename) {
        // we assume that in one commit there is only one modification for a file.
        return modifications.stream().filter(m -> filename.equals(m.getFilename())).findFirst();
    }

    public OffsetDateTime getCommitDate() {
        return commitDate;
    }

    public boolean isEmpty() {
        return modifications.isEmpty();
    }
}
