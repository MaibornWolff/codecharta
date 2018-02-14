package de.maibornwolff.codecharta.importer.scmlogparser.parser.git;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import java.util.Arrays;
import java.util.Collection;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(Parameterized.class)
public class GitLogNumstatParserStrategyRenamingTest {

    @Parameterized.Parameter
    public String fileLine;
    @Parameterized.Parameter(1)
    public String oldFilename;
    @Parameterized.Parameter(2)
    public String newFilename;
    private GitLogNumstatParserStrategy parserStrategy;

    @Parameterized.Parameters(name = "{index}: {0}")
    public static Collection<Object[]> data() {
        return Arrays.asList(new Object[][]{
                {"1 2 src/{RenameOld.java => RenameNew.java}", "src/RenameOld.java", "src/RenameNew.java"},
                {"1 2 {old => new}/Rename.java", "old/Rename.java", "new/Rename.java"},
                {"1 2 src/{ => new}/Rename.java", "src/Rename.java", "src/new/Rename.java"},
                {"1 2 src/{old => }/Rename.java", "src/old/Rename.java", "src/Rename.java"},
                {"1 2 src/{old => new}/Rename.java", "src/old/Rename.java", "src/new/Rename.java"},
                {"1\t2\tRename.java => new/Rename.java", "Rename.java", "new/Rename.java"},
                {"1\t2\tRenameOld.java => RenameNew.java", "RenameOld.java", "RenameNew.java"}
        });
    }

    @Before
    public void setup() {
        parserStrategy = new GitLogNumstatParserStrategy();
    }


    @Test
    public void isFileline() {
        assertThat(GitLogNumstatParserStrategy.isFileLine(fileLine)).isTrue();
    }

    @Test
    public void parseModification() {
        Modification modification = GitLogNumstatParserStrategy.parseModification(fileLine);

        assertThat(modification).extracting(Modification::getFilename, Modification::getOldFilename, Modification::getType, Modification::getAdditions, Modification::getDeletions)
                .containsExactly(newFilename, oldFilename, Modification.Type.RENAME, 1, 2);
    }
}
