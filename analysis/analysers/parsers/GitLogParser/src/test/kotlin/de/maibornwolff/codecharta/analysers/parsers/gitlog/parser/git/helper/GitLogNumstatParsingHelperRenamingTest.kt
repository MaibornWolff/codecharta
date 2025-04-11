package de.maibornwolff.codecharta.analysers.parsers.gitlog.parser.git.helper

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Modification
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import java.util.function.Function

class GitLogNumstatParsingHelperRenamingTest {
    companion object {
        @JvmStatic
        fun data() = listOf(
            Arguments.of(
                "1 2 src/{RenameOld.java => RenameNew.java}",
                "src/RenameOld.java",
                "src/RenameNew.java"
            ),
            Arguments.of("1 2 {old => new}/Rename.java", "old/Rename.java", "new/Rename.java"),
            Arguments.of("1 2 src/{ => new}/Rename.java", "src/Rename.java", "src/new/Rename.java"),
            Arguments.of("1 2 src/{old => }/Rename.java", "src/old/Rename.java", "src/Rename.java"),
            Arguments.of("1 2 src/{old => new}/Rename.java", "src/old/Rename.java", "src/new/Rename.java"),
            Arguments.of("1\t2\tRename.java => new/Rename.java", "Rename.java", "new/Rename.java"),
            Arguments.of("1\t2\tRenameOld.java => RenameNew.java", "RenameOld.java", "RenameNew.java")
        )
    }

    @ParameterizedTest
    @MethodSource("data")
    fun isFileline(fileLine: String) {
        assertTrue(GitLogNumstatParsingHelper.isFileLine(fileLine))
    }

    @ParameterizedTest
    @MethodSource("data")
    fun parseModification(fileLine: String, oldFilename: String, newFilename: String) {
        val modification = GitLogNumstatParsingHelper.parseModification(fileLine)

        assertThat(modification).extracting(
            Function<Modification, Any> { it.currentFilename },
            Function<Modification, Any> { it.oldFilename },
            Function<Modification, Any> { it.type },
            Function<Modification, Any> { it.additions },
            Function<Modification, Any> { it.deletions }
        ).containsExactly(newFilename, oldFilename, Modification.Type.RENAME, 1L, 2L)
    }
}
