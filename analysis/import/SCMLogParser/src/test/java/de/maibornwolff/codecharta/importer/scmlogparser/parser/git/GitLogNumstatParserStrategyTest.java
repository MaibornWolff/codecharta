package de.maibornwolff.codecharta.importer.scmlogparser.parser.git;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.ParserStrategyContractTest;
import org.assertj.core.util.Lists;
import org.junit.Before;
import org.junit.Test;

import java.util.List;
import java.util.stream.Stream;

import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;

public class GitLogNumstatParserStrategyTest extends ParserStrategyContractTest {

    private static final List<String> FULL_COMMIT = asList(
            "commit ca1fe2ba3be4",
            "Author: TheAuthor <mail@example.com>",
            "Date:   Tue May 9 19:57:57 2017 +0200",
            "    the commit message",
            "10 0 src/Added.java",
            "2 1 src/Modified.java",
            "0 20 src/Deleted.java");

    private GitLogNumstatParserStrategy parserStrategy;

    @Before
    public void setup() {
        parserStrategy = new GitLogNumstatParserStrategy();
    }

    @Override
    protected List<String> getFullCommit() {
        return FULL_COMMIT;
    }

    @Override
    protected LogParserStrategy getLogParserStrategy() {
        return parserStrategy;
    }

    @Override
    protected Stream<String> getTwoCommitsAsStraem() {
        List<String> twoCommits = Lists.newArrayList("commit");
        twoCommits.addAll(FULL_COMMIT);
        twoCommits.add("commit abcdef");
        twoCommits.addAll(FULL_COMMIT);
        twoCommits.add("commit");
        return twoCommits.stream();
    }

    @Test
    public void parsesFilenameFromFileMetadata() {
        String fileMetadata = "0 10\t src/Main.java";
        Modification modification = parserStrategy.parseModification(fileMetadata);
        assertThat(modification.getFilename()).isEqualTo("src/Main.java");
    }

    @Test
    public void parsesFilenamesFromUnusualFileMetadata() {
        assertThat(parserStrategy.parseModification("0\t10\tsrc/Main.java").getFilename())
                .isEqualTo("src/Main.java");
    }

    @Test
    public void isFilelineWorksForStandardExamples() {
        assertThat(GitLogNumstatParserStrategy.isFileLine("0\t10\tsrc/Main.java")).isTrue();
        assertThat(GitLogNumstatParserStrategy.isFileLine("0\t10\tsrc/Main.java ")).isTrue();
    }

    @Test
    public void parsesFilenameFromFileMetadataWithRename() {
        String fileMetadata = "9 2 src/{RenameOld.java => RenameNew.java}";
        Modification modification = parserStrategy.parseModification(fileMetadata);

        assertThat(GitLogNumstatParserStrategy.isFileLine(fileMetadata)).isTrue();
        assertThat(modification).extracting(Modification::getFilename, Modification::getOldFilename, Modification::getType, Modification::getAdditions, Modification::getDeletions)
                .containsExactly("src/RenameNew.java", "src/RenameOld.java", Modification.Type.RENAME, 9, 2);
    }


    @Test
    public void parsesFilenameFromFileMetadataWithRename2() {
        String fileMetadata = "1\t2\tRename.java => new/Rename.java";
        Modification modification = parserStrategy.parseModification(fileMetadata);

        assertThat(GitLogNumstatParserStrategy.isFileLine(fileMetadata)).isTrue();
        assertThat(modification).extracting(Modification::getFilename, Modification::getOldFilename, Modification::getType, Modification::getAdditions, Modification::getDeletions)
                .containsExactly("new/Rename.java", "Rename.java", Modification.Type.RENAME, 1, 2);
    }

    @Test
    public void parsesFilenameFromFileMetadataWithDirectoryRename() {
        String fileMetadata = "1 1 {old => new}/Rename.java";
        Modification modification = parserStrategy.parseModification(fileMetadata);

        assertThat(GitLogNumstatParserStrategy.isFileLine(fileMetadata)).isTrue();
        assertThat(modification).extracting(Modification::getFilename, Modification::getOldFilename, Modification::getType, Modification::getAdditions, Modification::getDeletions)
                .containsExactly("new/Rename.java", "old/Rename.java", Modification.Type.RENAME, 1, 1);
    }
}
