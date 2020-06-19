package de.maibornwolff.codecharta.importer.scmlogparser.parser.git

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.Parameterized
import java.util.Arrays
import java.util.function.Function

@RunWith(Parameterized::class)
class GitLogNumstatParserStrategyRenamingTest(
    private val fileLine: String,
    private val oldFilename: String,
    private val newFilename: String
) {

    companion object {

        @JvmStatic
        @Parameterized.Parameters(name = "{index}: {0}")
        fun data(): Collection<Array<Any>> {
            return Arrays.asList(
                    arrayOf<Any>("1 2 src/{RenameOld.java => RenameNew.java}", "src/RenameOld.java",
                            "src/RenameNew.java"),
                    arrayOf<Any>("1 2 {old => new}/Rename.java", "old/Rename.java", "new/Rename.java"),
                    arrayOf<Any>("1 2 src/{ => new}/Rename.java", "src/Rename.java", "src/new/Rename.java"),
                    arrayOf<Any>("1 2 src/{old => }/Rename.java", "src/old/Rename.java", "src/Rename.java"),
                    arrayOf<Any>("1 2 src/{old => new}/Rename.java", "src/old/Rename.java", "src/new/Rename.java"),
                    arrayOf<Any>("1\t2\tRename.java => new/Rename.java", "Rename.java", "new/Rename.java"),
                    arrayOf<Any>("1\t2\tRenameOld.java => RenameNew.java", "RenameOld.java", "RenameNew.java"))
        }
    }

    @Test
    fun isFileline() {
        assertThat(GitLogNumstatParserStrategy.isFileLine(fileLine)).isTrue()
    }

    @Test
    fun parseModification() {
        val modification = GitLogNumstatParserStrategy.parseModification(fileLine)

        assertThat(modification).extracting(Function<Modification, Any> { it.filename },
                Function<Modification, Any> { it.oldFilename },
                Function<Modification, Any> { it.type },
                Function<Modification, Any> { it.additions },
                Function<Modification, Any> { it.deletions })
                .containsExactly(newFilename, oldFilename, Modification.Type.RENAME, 1L, 2L)
    }
}
