package de.maibornwolff.codecharta.dialogProvider

import de.maibornwolff.codecharta.serialization.FileExtension
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class DialogDirectoryProviderTest {
    @Test
    fun `this should provide a good change directory experience`() {
        val uut = DialogDirectoryProvider(InputType.FOLDER_AND_FILE, listOf(FileExtension.CCJSON))
        uut.prepareMatches("")
        assertThat(uut.getHint("someInput")).isEqualTo("")
    }
}
