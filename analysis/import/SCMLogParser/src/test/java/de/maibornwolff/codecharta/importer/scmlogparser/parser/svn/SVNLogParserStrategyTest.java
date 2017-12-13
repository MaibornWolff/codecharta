package de.maibornwolff.codecharta.importer.scmlogparser.parser.svn;

import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.ParserStrategyContractTest;
import org.assertj.core.util.Lists;
import org.junit.Before;
import org.junit.Test;

import java.util.List;
import java.util.stream.Stream;

import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;

public class SVNLogParserStrategyTest extends ParserStrategyContractTest {

    private static final List<String> FULL_COMMIT = asList(
            "------------------------------------------------------------------------",
            "r2 | TheAuthor | 2017-05-09 19:57:57 +0200 (Tue, 9 May 2017) | 1 line",
            "Changed paths:",
            "   A /trunk/src/Main.java",
            "   M /trunk/src/Main.java",
            "   A /trunk/src/Util.java",
            "the commit message");

    private SVNLogParserStrategy parserStrategy;

    @Before
    public void setup() {
        parserStrategy = new SVNLogParserStrategy();
    }

    @Override
    protected List<String> getFullCommit() {
        return FULL_COMMIT;
    }


    @Override
    protected Stream<String> getTwoCommitsAsStraem() {
        List<String> twoCommits = Lists.newArrayList("------------------------------------------------------------------------");
        twoCommits.addAll(FULL_COMMIT);
        twoCommits.add("------------------------------------------------------------------------");
        twoCommits.addAll(FULL_COMMIT);
        twoCommits.add("------------------------------------------------------------------------");
        return twoCommits.stream();
    }

    @Override
    protected LogParserStrategy getLogParserStrategy() {
        return parserStrategy;
    }

    @Test
    public void parsesFilenameFromFileMetadata() {
        String filename = parserStrategy.parseFilename("   M /src/srcFolderTest.txt");
        assertThat(filename).isEqualTo("/src/srcFolderTest.txt");
    }

    @Test
    public void doesNotParseFilenameWithoutADot() {
        String filename = parserStrategy.parseFilename("   A /innerFolder");
        assertThat(filename).isEmpty();
    }

    @Test
    public void removesStandardSVNFoldersInFilename() {
        String filename = parserStrategy.parseFilename("   M /trunk/src/srcFolderTest.txt");
        assertThat(filename).isEqualTo("src/srcFolderTest.txt");
    }


    @Test
    public void acceptsSVNLogWithoutEndingDashes() {
        Stream<String> logLinesWithoutEndingDashes = Stream.of("-----------", "commit data");
        Stream<List<String>> commits = logLinesWithoutEndingDashes.collect(parserStrategy.createLogLineCollector());
        assertThat(commits).hasSize(1);
    }
}
