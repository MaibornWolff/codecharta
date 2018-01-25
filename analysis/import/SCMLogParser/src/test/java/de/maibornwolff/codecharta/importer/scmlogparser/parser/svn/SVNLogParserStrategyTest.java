package de.maibornwolff.codecharta.importer.scmlogparser.parser.svn;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.ParserStrategyContractTest;
import org.assertj.core.util.Lists;
import org.junit.Before;
import org.junit.Test;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;

public class SVNLogParserStrategyTest extends ParserStrategyContractTest {

    private static final List<String> FULL_COMMIT = asList(
            "------------------------------------------------------------------------",
            "r2 | TheAuthor | 2017-05-09 19:57:57 +0200 (Tue, 9 May 2017) | 1 line",
            "Changed paths:",
            "   A /trunk/src/Added.java",
            "   M /trunk/src/Modified.java",
            "   D /trunk/src/Deleted.java",
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
        Modification modification = parserStrategy.parseModification("   M /src/srcFolderTest.txt");
        assertThat(modification.getFilename()).isEqualTo("/src/srcFolderTest.txt");
        assertThat(modification.getType()).isEqualTo(Modification.Type.MODIFY);
    }

    @Test
    public void parsesFilenameFromAddedFile() {
        Modification modification = parserStrategy.parseModification("   A /src/srcFolderTest.txt");
        assertThat(modification.getFilename()).isEqualTo("/src/srcFolderTest.txt");
        assertThat(modification.getType()).isEqualTo(Modification.Type.ADD);
    }

    @Test
    public void parsesFilenameFromDeletedFile() {
        Modification modification = parserStrategy.parseModification("   D  /src/srcFolderTest.txt");
        assertThat(modification.getFilename()).isEqualTo("/src/srcFolderTest.txt");
        assertThat(modification.getType()).isEqualTo(Modification.Type.DELETE);
    }

    @Test
    public void parsesFilenameFromReplacedFile() {
        Modification modification = parserStrategy.parseModification("   R  /src/srcFolderTest.txt");
        assertThat(modification.getFilename()).isEqualTo("/src/srcFolderTest.txt");
        assertThat(modification.getType()).isEqualTo(Modification.Type.UNKNOWN);
    }

    @Test
    public void doesNotParseFilenameWithoutADot() {
        Modification modification = parserStrategy.parseModification("   A /innerFolder");
        assertThat(modification.getFilename()).isEmpty();
    }

    @Test
    public void removesStandardSVNFoldersInFilename() {
        Modification modification = parserStrategy.parseModification("   M /trunk/src/srcFolderTest.txt");
        assertThat(modification.getFilename()).isEqualTo("src/srcFolderTest.txt");
    }

    @Test
    public void acceptsSVNLogWithoutEndingDashes() {
        Stream<String> logLinesWithoutEndingDashes = Stream.of("-----------", "commit data");
        Stream<List<String>> commits = logLinesWithoutEndingDashes.collect(parserStrategy.createLogLineCollector());
        assertThat(commits).hasSize(1);
    }

    @Test
    public void ignoresTooShortLines() {
        List<String> lines = Arrays.asList(" A", "B");
        List<Modification> modifications = parserStrategy.parseModifications(lines);
        assertThat(modifications).isEmpty();
    }
}
