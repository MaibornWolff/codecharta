package de.maibornwolff.codecharta.model.input;

import de.maibornwolff.codecharta.model.input.metrics.ModificationMetric;
import de.maibornwolff.codecharta.model.input.metrics.NumberOfOccurencesInCommits;

import java.util.*;

public class VersionControlledFile {

    private final String filename;
    private final Set<CalendarWeek> weeksWithCommits;
    private final Set<String> authors;
    private final List<ModificationMetric> metrics = createModificationMetrics();

    public VersionControlledFile(String filename) {
        this.filename = filename;
        this.authors = new HashSet<>();
        this.weeksWithCommits = new HashSet<>();
    }

    private static List<ModificationMetric> createModificationMetrics() {
        return Arrays.asList(
                new NumberOfOccurencesInCommits()
        );
    }

    public void registerCommit(Commit commit) {
        visitModificationMetrics(commit.getModification(filename));
        visitCommitMetrics(commit);
    }

    private void visitCommitMetrics(Commit commit) {
        authors.add(commit.getAuthor());
        weeksWithCommits.add(CalendarWeek.forDateTime(commit.getCommitDate()));
    }

    private void visitModificationMetrics(Optional<Modification> modification) {
        if (modification.isPresent()) {
            metrics.forEach(m -> m.registerModification(modification.get()));
        }
    }

    public String getFilename() {
        return filename;
    }

    public int getNumberOfOccurrencesInCommits() {
        return metrics.stream()
                .filter(m -> m.metricName().equals("number_of_commits")).findAny().get()
                .value().intValue();
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
