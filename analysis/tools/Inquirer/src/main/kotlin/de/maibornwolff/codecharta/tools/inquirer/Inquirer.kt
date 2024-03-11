package de.maibornwolff.codecharta.tools.inquirer

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
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.util.InputHelper
import java.io.File

fun Session.myPromptInput(
        message: String,
        hint: String = "",
        allowEmptyInput: Boolean = false,
        canContainFolders: Boolean = false,
        invalidInputMessage: String = "Input is invalid!",
        inputValidator: (String, Boolean) -> Boolean = {_, _ -> true}       //TODO: make this of a type, maybe InputHelper
): String {
    var returnValue = ""
    var hintText = hint
    var isInputValid by liveVarOf(true)
    section {
        bold {
            green { text("? ") }; text(message)
            if (isInputValid) {
                black(isBright = true) { textLine(if (allowEmptyInput) "  (empty input is allowed)" else "") }
            } else {
                red { textLine(if (returnValue.isEmpty()) "  Empty input is not allowed!" else "  $invalidInputMessage") }
            }
        }
        text("> "); input(Completions(hintText), initialText = "")
    }.runUntilSignal {
        onInputChanged { isInputValid = true }
        onInputEntered {
            isInputValid = InputHelper.isInputValidAndNotNull(arrayOf(File(input)), canContainFolders)
            returnValue = input
            if ((allowEmptyInput && input.isEmpty()) || (isInputValid && input.isNotEmpty())) {
                isInputValid = true
                hintText = ""
                signal()
            }
        }
    }
    return returnValue
}

//TODO: should the PromptInputNumber be refactored together with PromptInput somehow?

fun Session.myPromptInputNumber(
        message: String,
        hint: String = "",
        allowEmptyInput: Boolean = false,
        invalidInputMessage: String = "Input is invalid!"
): String {
    var returnValue = ""
    var hintText = hint
    var isInputValid by liveVarOf(true)
    section {
        bold {
            green { text("? ") }; text(message)
            if (isInputValid) {
                black(isBright = true) { textLine(if (allowEmptyInput) "  (empty input is allowed)" else "") }
            } else {
                red { textLine(if (returnValue.isEmpty()) "  Empty input is not allowed!" else "  $invalidInputMessage") }
            }
        }
        text("> "); input(Completions(hintText), initialText = "")
    }.runUntilSignal {
        onInputChanged {isInputValid = true; input = input.filter { it.isDigit() } }
        onInputEntered {
            // isInputValid = validityCheck...              //damit kann der else fall dann weg
            if (allowEmptyInput || input.isNotEmpty()) {
                returnValue = input
                hintText = ""
                signal()
            } else {
                isInputValid = false
            }
        }
    }
    return returnValue
}

fun Session.myPromptConfirm(message: String): Boolean {
    var result = true
    var res by liveVarOf(true)
    section {
        green { text("? ") }; text(message)
        black(isBright = true) { textLine("  (use arrow keys to change selection)") } //TODO: is note this necessary?
        if (res) {
            text("> "); cyan { text("[Yes]") }; textLine(" No ")
        } else {
            text(">  Yes "); cyan { textLine("[No]") }
        }
    }.runUntilSignal {
        onKeyPressed {
            when (key) {
                Keys.LEFT -> res = true
                Keys.RIGHT -> res = false
                Keys.ENTER -> { result = res; signal() }
            }
        }
    }
    return result
}

fun Session.myPromptList(message: String, choices: List<String>, hint: String = ""): String {
    var result = ""
    var selection by liveVarOf(0)
    section {
        green { text("? ") }; text(message); black(isBright = true) { textLine("  $hint") }
        for (i in choices.indices) {
            if (i == selection) {
                cyan(isBright = true) { text(" ❯ ") }; cyan { textLine(choices[i]) }
            } else {
                textLine("   ${choices[i]}")
            }
        }
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
        green { text("? ") }; text(message)
        if (isInputValid) {
            black(isBright = true) { textLine(if (allowEmptyInput) "  $hint  (empty selection is allowed)" else "  $hint") }
        } else {
            red { textLine("  Empty selection is not allowed!") }
        }
        for (i in choices.indices) {
            cyan(isBright = true) { text(if (i == pos) " ❯ " else "   ") }
            if (selectedElems[i]) {
                green { text("◉ ") }; cyan { textLine(choices[i]) }
            } else {
                textLine("◯ ${choices[i]}")
            }
        }
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

private fun getSelectedElems(choices: List<String>, selection: List<Boolean>): List<String> {
    val result = mutableListOf<String>()
    for (i in choices.indices) {
        if (selection[i]) result.add(choices[i])
    }
    return result
}
