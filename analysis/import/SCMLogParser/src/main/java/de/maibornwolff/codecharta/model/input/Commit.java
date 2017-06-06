package de.maibornwolff.codecharta.model.input;

import java.time.LocalDateTime;
import java.util.List;

public class Commit {

    private final String author;

    private final List<String> filenames;

    private final LocalDateTime commitDate;

    public Commit(String author, List<String> filenames, LocalDateTime commitDate) {
        this.author = author;
        this.filenames = filenames;
        this.commitDate = commitDate;
    }

    public String getAuthor() {
        return author;
    }

    public List<String> getFilenames() {
        return filenames;
    }

    public LocalDateTime getCommitDate() {
        return commitDate;
    }
}
