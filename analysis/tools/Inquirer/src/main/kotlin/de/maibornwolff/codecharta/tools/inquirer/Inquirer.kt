package de.maibornwolff.codecharta.tools.inquirer

import com.varabyte.kotter.foundation.input.Completions
import com.varabyte.kotter.foundation.input.input
import com.varabyte.kotter.foundation.input.onInputChanged
import com.varabyte.kotter.foundation.input.onInputEntered
import com.varabyte.kotter.foundation.input.runUntilInputEntered
import com.varabyte.kotter.foundation.runUntilSignal
import com.varabyte.kotter.foundation.session
import com.varabyte.kotter.foundation.text.bold
import com.varabyte.kotter.foundation.text.green
import com.varabyte.kotter.foundation.text.red
import com.varabyte.kotter.foundation.text.text
import com.varabyte.kotter.foundation.text.textLine

class Inquirer {
    companion object {
        fun myPromptInput(message: String, hint: String = ""): String { //todo, add flag to accept empty input or not
            var returnValue = ""
            session {
                run {
                    section {
                        bold { green { text("? ") }; textLine(message) }
                        text("> "); input(Completions(hint), initialText = "")
                    }.runUntilInputEntered {
                        onInputEntered { returnValue = input; return@onInputEntered }
                    }
                }
            }
            return returnValue
        }

        fun myPromptInputNumber(
                message: String, hint: String = "",
                allowEmpty: Boolean = false,
                invalidInputMessage: String = "Input is invalid!"
        ): String {
            var returnValue = ""
            var showError = false
            session {
                run {
                    section {
                        bold {
                            green { text("? ") }; text(message)
                            if (showError) red { textLine(" $invalidInputMessage") } else textLine("")
                        }
                        text("> "); input(Completions(hint), initialText = "")
                    }.runUntilSignal {
                        onInputChanged { showError = false; input = input.filter { it.isDigit() } }
                        onInputEntered {
                            if (allowEmpty || input.isNotEmpty()) {
                                returnValue = input
                                signal()
                            }
                            else {
                                showError = true
                            }
                        }
                    }
                }
            }
            return returnValue
        }
    }
}
