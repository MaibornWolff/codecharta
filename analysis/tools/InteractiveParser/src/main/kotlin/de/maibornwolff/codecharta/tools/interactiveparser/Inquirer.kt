package de.maibornwolff.codecharta.tools.interactiveparser

import com.varabyte.kotter.foundation.*
import com.varabyte.kotter.foundation.input.*
import com.varabyte.kotter.foundation.text.*

class Inquirer {
    companion object {
        fun myPromptInput(message: String, hint: String): String {
            var returnValue = ""
            session {
                run {
                    section {
                        bold { green { text("? ") }; textLine(message) };
                        text("> "); input(Completions(hint), initialText = "")
                    }.runUntilInputEntered {
                        onInputEntered { returnValue = input; return@onInputEntered}
                    }
                }
            }
            return returnValue
        }
    }
}
