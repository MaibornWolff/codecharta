package de.maibornwolff.codecharta.tools.inquirer

import com.varabyte.kotter.foundation.collections.LiveList
import com.varabyte.kotter.foundation.collections.liveListOf
import com.varabyte.kotter.foundation.input.Completions
import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.foundation.input.input
import com.varabyte.kotter.foundation.input.onInputChanged
import com.varabyte.kotter.foundation.input.onInputEntered
import com.varabyte.kotter.foundation.input.onKeyPressed
import com.varabyte.kotter.foundation.liveVarOf
import com.varabyte.kotter.foundation.runUntilSignal
import com.varabyte.kotter.foundation.text.black
import com.varabyte.kotter.foundation.text.bold
import com.varabyte.kotter.foundation.text.cyan
import com.varabyte.kotter.foundation.text.green
import com.varabyte.kotter.foundation.text.red
import com.varabyte.kotter.foundation.text.text
import com.varabyte.kotter.foundation.text.textLine
import com.varabyte.kotter.runtime.MainRenderScope
import com.varabyte.kotter.runtime.Session

fun Session.myPromptInput(
        message: String,
        hint: String = "",
        allowEmptyInput: Boolean = false,
        invalidInputMessage: String = "Input is invalid!",
        inputValidator: (String) -> Boolean = { true }
): String {
    var lastUserInput = ""
    var hintText = hint
    var isInputValid by liveVarOf(true)
    section {
        drawInput(message, hintText, isInputValid, allowEmptyInput, invalidInputMessage, lastUserInput)
    }.runUntilSignal {
        onInputChanged { isInputValid = true }
        onInputEntered {
            if ((allowEmptyInput && input.isEmpty()) || (inputValidator(input) && input.isNotEmpty())) {
                isInputValid = true
                hintText = ""
                signal()
            } else {
                isInputValid = false
            }
            lastUserInput = input
        }
    }
    return lastUserInput
}

private fun MainRenderScope.drawInput(
        message: String,
        hint: String,
        isInputValid: Boolean,
        allowEmptyInput: Boolean,
        invalidInputMessage: String,
        lastUserInput: String
) {
    bold {
        green { text("? ") }; text(message)
        if (isInputValid) {
            black(isBright = true) { textLine(if (allowEmptyInput) "  empty input is allowed" else "") }
        } else {
            red { textLine(if (lastUserInput.isEmpty()) "  Empty input is not allowed!" else "  $invalidInputMessage") }
        }
    }
    text("> "); input(Completions(hint), initialText = "")
}

fun Session.myPromptInputNumber(
        message: String,
        hint: String = "",
        allowEmptyInput: Boolean = false,
        invalidInputMessage: String = "Input is invalid!",
        inputValidator: (String) -> Boolean = { true }
): String {
    var lastUserInput = ""
    var hintText = hint
    var isInputValid by liveVarOf(true)
    section {
        drawInput(message, hintText, isInputValid, allowEmptyInput, invalidInputMessage, lastUserInput)
    }.runUntilSignal {
        onInputChanged {isInputValid = true; input = input.filter { it.isDigit() } }
        onInputEntered {
            if ((allowEmptyInput && input.isEmpty()) || (inputValidator(input) && input.isNotEmpty())) {
                isInputValid = true
                hintText = ""
                signal()
            } else {
                isInputValid = false
            }
            lastUserInput = input
        }
    }
    return lastUserInput
}

fun Session.myPromptConfirm(
        message: String,
        hint: String = "arrow keys to change selection"
): Boolean {
    var result = true
    var choice by liveVarOf(true)
    section {
        drawConfirm(message, hint, choice)
    }.runUntilSignal {
        onKeyPressed {
            println(key)
            when (key) {
                Keys.LEFT -> choice = true
                Keys.RIGHT -> choice = false
                Keys.ENTER -> { result = choice; signal() }
            }
        }
    }
    return result
}

private fun MainRenderScope.drawConfirm(message: String, hint: String, choice: Boolean) {
    bold {
        green { text("? ") }; text(message)
        black(isBright = true) { textLine("  $hint") }
    }
    if (choice) {
        text("> "); cyan { text("[Yes]") }; textLine(" No ")
    } else {
        text(">  Yes "); cyan { textLine("[No]") }
    }
}

fun Session.myPromptList(
        message: String,
        choices: List<String>,
        hint: String = "arrow keys to move, ENTER to select"): String {
    var result = ""
    var selection by liveVarOf(0)
    section {
        drawList(message, hint, choices, selection)
    }.runUntilSignal {
        onKeyPressed {
            when (key) {
                Keys.UP -> if (selection> 0) { selection -= 1 }
                Keys.DOWN -> if (selection <choices.size - 1) { selection += 1 }
                Keys.ENTER -> { result = choices[selection]; signal() }
            }
        }
    }
    return result
}

private fun MainRenderScope.drawList(
        message: String,
        hint: String,
        choices: List<String>,
        selection: Int
) {
    bold { green { text("? ") }; text(message); black(isBright = true) { textLine("  $hint") } }
    for (i in choices.indices) {
        if (i == selection) {
            cyan(isBright = true) { text(" ❯ ") }; cyan { textLine(choices[i]) }
        } else {
            textLine("   ${choices[i]}")
        }
    }
}

fun Session.myPromptCheckbox(
        message: String,
        choices: List<String>,
        allowEmptyInput: Boolean = false,
        hint: String = "SPACE to select, ENTER to confirm selection"
): List<String> {
    var result = listOf<String>()
    var pos by liveVarOf(0)
    val selectedElems = liveListOf(MutableList(choices.size) { false })
    var isInputValid by liveVarOf(true)
    section {
        drawCheckbox(message, hint, isInputValid, allowEmptyInput, choices, pos, selectedElems)
    }.runUntilSignal {
        onKeyPressed {
            isInputValid = true
            when (key) {
                Keys.UP -> if (pos > 0) { pos -= 1 }
                Keys.DOWN -> if (pos < choices.size - 1) { pos += 1 }
                Keys.SPACE -> selectedElems[pos] = !selectedElems[pos]
                Keys.ENTER -> {
                    result = getSelectedElems(choices, selectedElems)
                    if (allowEmptyInput || result.isNotEmpty()) {
                        signal()
                    } else {
                        isInputValid = false
                    }
                }
            }
        }
    }
    return result
}

private fun MainRenderScope.drawCheckbox(
        message: String,
        hint: String,
        isInputValid: Boolean,
        allowEmptyInput: Boolean,
        choices: List<String>,
        pos: Int,
        selectedElems: LiveList<Boolean>
) {
    bold {
        green { text("? ") }; text(message)
        if (isInputValid) {
            black(isBright = true) { textLine(if (allowEmptyInput) "  $hint  empty selection is allowed" else "  $hint") }
        } else {
            red { textLine("  Empty selection is not allowed!") }
        }
    }
    for (i in choices.indices) {
        cyan(isBright = true) { text(if (i == pos) " ❯ " else "   ") }
        if (selectedElems[i]) {
            green { text("◉ ") }; cyan { textLine(choices[i]) }
        } else {
            textLine("◯ ${choices[i]}")
        }
    }
}

private fun getSelectedElems(choices: List<String>, selection: List<Boolean>): List<String> {
    val result = mutableListOf<String>()
    for (i in choices.indices) {
        if (selection[i]) result.add(choices[i])
    }
    return result
}
