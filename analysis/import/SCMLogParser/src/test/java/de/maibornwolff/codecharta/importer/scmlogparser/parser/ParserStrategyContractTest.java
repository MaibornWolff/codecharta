package de.maibornwolff.codecharta.importer.scmlogparser.parser;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory;
import org.junit.Test;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Stream;

import static java.util.Collections.singleton;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

public abstract class ParserStrategyContractTest {

    private static final ZoneOffset ZONE_OFFSET = ZoneOffset.ofHours(2);
    private final MetricsFactory metricsFactory = new MetricsFactory();

    /**
     * This method should return test data for the contract test. <br><br>
     * Must return a List of String representing a normal/default commit of the underlying SCM System
     * We assume that a commit can be represented as a list of Strings containing all necessary
     * informations a LogParserStrategy can extract.<br>
     * The test data set should contain a parsable author "TheAuthor", a parsable date with the
     * offsetDateTime "OffsetDateTime.of(2017, 5, 9, 19, 57, 57, 0, ZONE_OFFSET)" (Tue May 9 19:57:57 2017 +2:00) and three files of the commit
     * whereby one filename is duplicated; "src/Main.java","src/Main.java","src/Util.java"
     *
     * @return the test data as a List<String>
     */
    protected abstract List<String> getFullCommit();

    protected abstract LogParserStrategy getLogParserStrategy();

    protected abstract Stream<String> getTwoCommitsAsStraem();

    @Test
    public void parsesCommit() {
        LogLineParser parser = new LogLineParser(getLogParserStrategy(), metricsFactory);
        Commit commit = parser.parseCommit(getFullCommit());
        assertThat(commit)
                .extracting(Commit::getAuthor, Commit::getCommitDate)
                .containsExactly("TheAuthor", OffsetDateTime.of(2017, 5, 9, 19, 57, 57, 0, ZONE_OFFSET));
        assertThat(commit.getFilenames())
                .containsExactlyInAnyOrder("src/Added.java", "src/Modified.java", "src/Deleted.java");
    }

    @Test
    public void parsesFilesInCommitLines() {
        List<Modification> modifications = getLogParserStrategy().parseModifications(getFullCommit());
        assertThat(modifications).hasSize(3);
        assertThat(modifications)
                .extracting(Modification::getFilename)
                .containsExactlyInAnyOrder("src/Added.java", "src/Modified.java", "src/Deleted.java");
    }

    @Test
    public void parseAuthorFromCommitLines() {
        String author = getLogParserStrategy().parseAuthor(getFullCommit()).get();
        assertThat(author).isEqualTo("TheAuthor");
    }

    @Test
    public void parseDateFromCommitLines() {
        OffsetDateTime commitDate = getLogParserStrategy().parseDate(getFullCommit()).get();
        assertThat(commitDate).isEqualToIgnoringNanos(OffsetDateTime.of(2017, 5, 9, 19, 57, 57, 0, ZONE_OFFSET));
    }

    @Test
    public void canProvidesAnAproppriateLogLineCollectorToSeparateCommits() throws Exception {
        Stream<List<String>> commits = getTwoCommitsAsStraem().collect(getLogParserStrategy().createLogLineCollector());
        assertThat(commits).hasSize(2);
    }


    @Test
    public void accumulatesCommitFiles() {
        LogLineParser parser = new LogLineParser(getLogParserStrategy(), metricsFactory);

        Stream<String> logLines = Stream.concat(getFullCommit().stream(), getFullCommit().stream());
        List<VersionControlledFile> files = parser.parse(logLines);
        assertThat(files)
                .extracting(VersionControlledFile::getFilename, f -> f.getMetricValue("number_of_commits"), VersionControlledFile::getAuthors)
                .containsExactlyInAnyOrder(
                        tuple("src/Deleted.java", 2L, singleton("TheAuthor")),
                        tuple("src/Added.java", 2L, singleton("TheAuthor")),
                        tuple("src/Modified.java", 2L, singleton("TheAuthor")));
    }
}
