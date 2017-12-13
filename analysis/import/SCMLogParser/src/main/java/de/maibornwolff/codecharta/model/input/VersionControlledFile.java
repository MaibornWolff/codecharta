package de.maibornwolff.codecharta.model.input;

import java.util.HashSet;
import java.util.Set;

public class VersionControlledFile {

    private final String filename;

    private int numberOfOccurrencesInCommits;

    private final Set<CalendarWeek> weeksWithCommits;

    private final Set<String> authors;

    public VersionControlledFile(String filename) {
        this.filename = filename;
        this.numberOfOccurrencesInCommits = 0;
        this.authors = new HashSet<>();
        this.weeksWithCommits = new HashSet<>();
    }

    public void registerCommit(Commit commit) {
        numberOfOccurrencesInCommits++;
        authors.add(commit.getAuthor());
        weeksWithCommits.add(CalendarWeek.forDateTime(commit.getCommitDate()));
    }

    public String getFilename() {
        return filename;
    }

    public int getNumberOfOccurrencesInCommits() {
        return numberOfOccurrencesInCommits;
    }

    public Set<String> getAuthors() {
        return authors;
    }

    public int getNumberOfAuthors() {
        return this.authors.size();
    }

    @Override
    public String toString() {
        return this.getFilename() + " was changed " + this.getNumberOfOccurrencesInCommits() + " time(s).";
    }

    public int getNumberOfWeeksWithCommits() {
        return weeksWithCommits.size();

    }


}
