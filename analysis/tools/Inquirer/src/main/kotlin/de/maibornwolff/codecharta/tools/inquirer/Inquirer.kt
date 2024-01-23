package de.maibornwolff.codecharta.tools.inquirer

import com.varabyte.kotter.foundation.input.Completions
import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.foundation.input.input
import com.varabyte.kotter.foundation.input.onInputChanged
import com.varabyte.kotter.foundation.input.onInputEntered
import com.varabyte.kotter.foundation.input.onKeyPressed
import com.varabyte.kotter.foundation.input.runUntilInputEntered
import com.varabyte.kotter.foundation.liveVarOf
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
                section {
                    bold { green { text("? ") }; textLine(message) }
                    text("> "); input(Completions(hint), initialText = "")
                }.runUntilInputEntered {
                    onInputEntered { returnValue = input; return@onInputEntered }
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
            return returnValue
        }

        fun myPromptConfirm(message: String): Boolean {
            var result = true
            session {
                var res by liveVarOf(true)
                section {
                    green { text("? ") }; text(message)
                    if (res) textLine(" [Yes] No ") else textLine("  Yes [No]")
                }.runUntilSignal{
                    onKeyPressed {
                        when(key) {
                            Keys.LEFT -> res = true
                            Keys.RIGHT -> res = false
                            Keys.ENTER -> { result = res; signal() }
                        }
                    }
                }
            }
            return result
        }
    }
}
