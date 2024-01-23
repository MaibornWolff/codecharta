package de.maibornwolff.codecharta.tools.inquirer

import com.varabyte.kotter.foundation.input.Completions
import com.varabyte.kotter.foundation.input.input
import com.varabyte.kotter.foundation.input.onInputEntered
import com.varabyte.kotter.foundation.input.runUntilInputEntered
import com.varabyte.kotter.foundation.session
import com.varabyte.kotter.foundation.text.bold
import com.varabyte.kotter.foundation.text.green
import com.varabyte.kotter.foundation.text.text
import com.varabyte.kotter.foundation.text.textLine

class Inquirer {
    companion object {
        fun myPromptInput(message: String, hint: String): String {
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
    }
}
