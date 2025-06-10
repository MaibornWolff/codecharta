package de.maibornwolff.codecharta.dialogProvider

import de.maibornwolff.codecharta.serialization.FileExtension
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class DirectoryNavigatorTest {
    @Test
    fun `this should provide a good change directory experience`() {
        val uut = DirectoryNavigator(InputType.FOLDER_AND_FILE, listOf(FileExtension.CCJSON), false)
        uut.prepareMatches("")
        assertThat(uut.getHints()).isEqualTo("")
    }
}
