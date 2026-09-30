package de.maibornwolff.codecharta.dialogProvider

import com.varabyte.kotter.foundation.input.Key
import com.varabyte.kotter.runtime.terminal.inmemory.InMemoryTerminal
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.resolveRerenders
import com.varabyte.kotterx.test.runtime.stripFormatting

internal object PromptTestFixtures {
    const val TEST_INPUT = "this is text to simulate user input."
    const val TEST_MESSAGE = "this test message is displayed as the question."
    const val TEST_HINT = "this is displayed as the hint for a prompt."
    const val TEST_INVALID_INPUT_MESSAGE = "this is displayed as a message for invalid inputs."

    const val EMPTY_INPUT_ALLOWED_MESSAGE = "Empty input is allowed"
    const val EMPTY_INPUT_NOT_ALLOWED_MESSAGE = "Empty input is not allowed!"
    const val EMPTY_SELECTION_ALLOWED_MESSAGE = "Empty selection is allowed"
    const val EMPTY_SELECTION_NOT_ALLOWED_MESSAGE = "Empty selection is not allowed!"

    val TEST_CHOICES = listOf("element 0", "element 1", "element 2", "element 3")

    fun InMemoryTerminal.renderedLines(): List<String> = resolveRerenders().stripFormatting()

    suspend fun InMemoryTerminal.pressEach(keys: List<Key>) {
        keys.forEach { press(it) }
    }

    fun repeatKey(key: Key, times: Int): List<Key> = List(times) { key }
}
