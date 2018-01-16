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

public class GitLogNumstatRawParserStrategyTest extends ParserStrategyContractTest {

    private static final List<String> FULL_COMMIT = asList(
            "commit ca1fe2ba3be4",
            "Author: TheAuthor <mail@example.com>",
            "Date:   Tue May 9 19:57:57 2017 +0200",
            "    the commit message",
            "10 0 src/Added.java",
            "2 1 src/Modified.java",
            "0 20 src/Deleted.java",
            ":100644 100644 afb6ce4... b1c5aa3... A  src/Added.java",
            ":100644 100644 6c30570... 79b6243... M  src/Modified.java",
            ":100644 100644 64d6a85... 8c57f3d... D  src/Deleted.java");

    private GitLogNumstatRawParserStrategy parserStrategy;

    @Before
    public void setup() {
        parserStrategy = new GitLogNumstatRawParserStrategy();
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
    public void parsesFilenameFromFileMetadataNumstat() {
        String fileMetadata = "0 10\t src/Main.java";
        Modification modification = parserStrategy.parseModification(fileMetadata);
        assertThat(modification.getFilename()).isEqualTo("src/Main.java");
    }

    @Test
    public void parsesFilenameFromFileMetadataRaw() {
        String fileMetadata = ":100644 100644 afb6ce4... b1c5aa3... A  src/Added.java";
        Modification modification = parserStrategy.parseModification(fileMetadata);
        assertThat(modification.getFilename()).isEqualTo("src/Added.java");
    }

    @Test
    public void aggregateNumstatAndRaw() {
        List<String> commitLines = asList(
                "commit ca1fe2ba3be4",
                "Author: TheAuthor <mail@example.com>",
                "Date:   Tue May 9 19:57:57 2017 +0200",
                "    the commit message",
                "10 0 src/Added.java",
                ":100644 100644 afb6ce4... b1c5aa3... A  src/Added.java");
        List<Modification> modifications = parserStrategy.parseModifications(commitLines);
        assertThat(modifications).hasSize(1);
        Modification modification = modifications.get(0);
        assertThat(modification).extracting(Modification::getFilename, Modification::getOldFilename, Modification::getType, Modification::getAdditions, Modification::getDeletions)
                .containsExactly("src/Added.java", "", Modification.Type.ADD, 10, 0);
    }

    @Test
    public void aggregateNumstatAndRawWithRename() {
        List<String> commitLines = asList(
                "commit ca1fe2ba3be4",
                "Author: TheAuthor <mail@example.com>",
                "Date:   Tue May 9 19:57:57 2017 +0200",
                "    the commit message",
                "9 2 src/{RenameOld.java => RenameNew.java}",
                ":100644 100644 e7ab6f3... 0c5845c... R079 src/RenameOld.java src/RenameNew.java");
        List<Modification> modifications = parserStrategy.parseModifications(commitLines);
        assertThat(modifications).hasSize(1);
        Modification modification = modifications.get(0);
        assertThat(modification).extracting(Modification::getFilename, Modification::getOldFilename, Modification::getType, Modification::getAdditions, Modification::getDeletions)
                .containsExactly("src/RenameNew.java", "src/RenameOld.java", Modification.Type.RENAME, 9, 2);
    }
}
