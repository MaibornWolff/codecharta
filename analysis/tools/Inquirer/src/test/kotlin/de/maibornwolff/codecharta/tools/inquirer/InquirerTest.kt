package de.maibornwolff.codecharta.tools.inquirer

import com.varabyte.kotter.foundation.text.black
import com.varabyte.kotter.foundation.text.bold
import com.varabyte.kotter.foundation.text.cyan
import com.varabyte.kotter.foundation.text.green
import com.varabyte.kotter.foundation.text.text
import com.varabyte.kotter.foundation.text.textLine
import com.varabyte.kotter.runtime.internal.ansi.Ansi
import com.varabyte.kotterx.test.foundation.testSession
import com.varabyte.kotterx.test.terminal.assertMatches
import com.varabyte.kotterx.test.terminal.type
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

class InquirerTest {

    private val testMessage = "unimportant test message"
    private val defaultConfirmHint = "arrow keys to change selection"

    // Tests for promptInput TODO: test to correctly display a custom invalidInput message

    @Test
    fun `should return user input when no validity checker was specified`() {

    }

    @Test
    fun `should return empty input when the option to allow empty input was set`() {

    }

    @Test
    fun `should not accept input and display error when input is empty but empty input is not allowed`() {

    }

    @Test
    fun `should return valid input when a validity checker was specified and input is valid`() {

    }

    @Test
    fun `should not accept input and display error when a validity checker was specified but input was invalid`() {

    }

    @Test
    fun `should not accept input and display custom error when an invalidInputMessage and a validity checker were set`() {

    }

    // Tests for promptInputNumber

    @Test
    fun `should ignore input characters except numbers`() {

    }

//    @Test
//    fun `should return empty input when the option to allow empty input was set`() {
//
//    }
    //TODO: add more tests after refactor


    //Tests for promptConfirm

    @Test
    fun `should return true when no arrow keys were pressed`() {
        var result = false

        testSession { terminal ->
            result = myPromptConfirm(testMessage, onInputReady = {
                terminal.type(Ansi.CtrlChars.ENTER)
            })

            terminal.assertMatches {
                bold {
                    green { text("? ") }; text(testMessage)
                    black(isBright = true) { textLine("  $defaultConfirmHint") }
                }
                text("> "); cyan { text("[Yes]") }; textLine(" No ")
            }
        }

        Assertions.assertTrue(result)
    }

    @Test
    fun `should return false when right arrow key was pressed`() {

    }

    @Test
    fun `should correctly return when arrow keys were pressed multiple times`() {

    }

    //Tests for promptList

    @Test
    fun `should display all list options that were specified`() {

    }

    @Test
    fun `should select the first list option when no arrow keys were pressed`() {

    }

    @Test
    fun `should select the second list option when arrow down was pressed`() {

    }

    @Test
    fun `should select the last list option when arrow down was pressed more often than there are options`() {

    }

    //Tests for promptCheckbox

    @Test
    fun `should display all checkbox options that were specified`() {

    }

    @Test
    fun `should return empty input when no input was selected and the option for empty input was set`() {

    }

    @Test
    fun `should not accept input and display hint when selection is empty and the option for empty input was not set`() {

    }

    @Test
    fun `should select the first checkbox option when no arrow keys were pressed`() {

    }

    @Test
    fun `should select the second checkbox option when arrow down was pressed`() {

    }

    @Test
    fun `should select last checkbox option when arrow down was pressed more often than there are options`() {

    }

    @Test
    fun `should return all selected options when multiple were selected`() {

    }
}
