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

public class GitLogRawParserStrategyTest extends ParserStrategyContractTest {

    private static final List<String> FULL_COMMIT = asList(
            "commit ca1fe2ba3be4",
            "Author: TheAuthor <mail@example.com>",
            "Date:   Tue May 9 19:57:57 2017 +0200",
            "    the commit message",
            ":100644 100644 afb6ce4... b1c5aa3... A  src/Added.java",
            ":100644 100644 6c30570... 79b6243... M  src/Modified.java",
            ":100644 100644 64d6a85... 8c57f3d... D  src/Deleted.java");

    private GitLogRawParserStrategy parserStrategy;

    @Before
    public void setup() {
        parserStrategy = new GitLogRawParserStrategy();
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
        String fileMetadata = ":100644 100644 afb6ce4... b1c5aa3... M  src/Main.java";
        Modification modification = GitLogRawParserStrategy.parseModification(fileMetadata);
        assertThat(modification.getFilename()).isEqualTo("src/Main.java");
        assertThat(modification.getType()).isEqualTo(Modification.Type.MODIFY);
    }

    @Test
    public void parsesFilenameFromFileMetadataWithRename() {
        String fileMetadata = ":100644 100644 e7ab6f3... 0c5845c... R079 srcs/Main.java src/Main.java";
        Modification modification = GitLogRawParserStrategy.parseModification(fileMetadata);
        assertThat(modification.getFilename()).isEqualTo("src/Main.java");
        assertThat(modification.getOldFilename()).isEqualTo("srcs/Main.java");
        assertThat(modification.getType()).isEqualTo(Modification.Type.RENAME);
    }

    @Test
    public void parsesFilenameFromAddedFile() {
        String fileMetadata = ":100644 100644 afb6ce4... b1c5aa3... A  src/Main.java";
        Modification modification = GitLogRawParserStrategy.parseModification(fileMetadata);
        assertThat(modification.getFilename()).isEqualTo("src/Main.java");
        assertThat(modification.getType()).isEqualTo(Modification.Type.ADD);
    }

    @Test
    public void parsesFilenameFromDeletedFile() {
        String fileMetadata = ":100644 100644 64d6a85... 8c57f3d... D  src/Util.java";
        Modification modification = GitLogRawParserStrategy.parseModification(fileMetadata);
        assertThat(modification.getFilename()).isEqualTo("src/Util.java");
        assertThat(modification.getType()).isEqualTo(Modification.Type.DELETE);
    }
}
