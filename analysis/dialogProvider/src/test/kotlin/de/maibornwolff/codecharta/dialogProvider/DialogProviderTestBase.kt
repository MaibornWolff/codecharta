package de.maibornwolff.codecharta.dialogProvider

import io.mockk.unmockkAll
import org.junit.jupiter.api.AfterEach

abstract class DialogProviderTestBase {
    protected val testMessage = "this test message is displayed as the question."
    protected val testHint = "this is displayed as the hint for a prompt."

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }
}
