package de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git.helper

import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git.helper.GitLogNumstatParsingHelper
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test

class GitLogNumstatParsingHelperTest {

    @Test
    fun parsesFilenameFromFileMetadata() {
        val fileMetadata = "0 10\t src/Main.java"
        val modification = GitLogNumstatParsingHelper.parseModification(fileMetadata)
        assertThat(modification.currentFilename).isEqualTo("src/Main.java")
    }

    @Test
    fun parsesFilenamesFromUnusualFileMetadata() {
        assertThat(GitLogNumstatParsingHelper.parseModification("0\t10\tsrc/Main.java").currentFilename)
            .isEqualTo("src/Main.java")
    }

    @Test
    fun isFilelineWorksForStandardExamples() {
        assertThat(GitLogNumstatParsingHelper.isFileLine("0\t10\tsrc/Main.java")).isTrue()
        assertThat(GitLogNumstatParsingHelper.isFileLine("0\t10\tsrc/Main.java ")).isTrue()
    }
}
