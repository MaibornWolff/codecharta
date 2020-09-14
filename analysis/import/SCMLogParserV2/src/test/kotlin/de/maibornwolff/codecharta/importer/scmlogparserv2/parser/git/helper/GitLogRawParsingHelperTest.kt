package de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git.helper

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git.helper.GitLogRawParsingHelper
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test

class GitLogRawParsingHelperTest {

    @Test
    fun parsesFilenameFromFileMetadata() {
        val fileMetadata = ":100644 100644 afb6ce4... b1c5aa3... M  src/Main.java"
        val modification = GitLogRawParsingHelper.parseModification(fileMetadata)
        assertThat(modification.currentFilename).isEqualTo("src/Main.java")
        assertThat(modification.type).isEqualTo(Modification.Type.MODIFY)
    }

    @Test
    fun parsesFilenameFromFileMetadataWithRename() {
        val fileMetadata = ":100644 100644 e7ab6f3... 0c5845c... R079 srcs/Main.java src/Main.java"
        val modification = GitLogRawParsingHelper.parseModification(fileMetadata)
        assertThat(modification.currentFilename).isEqualTo("src/Main.java")
        assertThat(modification.oldFilename).isEqualTo("srcs/Main.java")
        assertThat(modification.type).isEqualTo(Modification.Type.RENAME)
    }

    @Test
    fun parsesFilenameFromAddedFile() {
        val fileMetadata = ":100644 100644 afb6ce4... b1c5aa3... A  src/Main.java"
        val modification = GitLogRawParsingHelper.parseModification(fileMetadata)
        assertThat(modification.currentFilename).isEqualTo("src/Main.java")
        assertThat(modification.type).isEqualTo(Modification.Type.ADD)
    }

    @Test
    fun parsesFilenameFromDeletedFile() {
        val fileMetadata = ":100644 100644 64d6a85... 8c57f3d... D  src/Util.java"
        val modification = GitLogRawParsingHelper.parseModification(fileMetadata)
        assertThat(modification.currentFilename).isEqualTo("src/Util.java")
        assertThat(modification.type).isEqualTo(Modification.Type.DELETE)
    }
}
