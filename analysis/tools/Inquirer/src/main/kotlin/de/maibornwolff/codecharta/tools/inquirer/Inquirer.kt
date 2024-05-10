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
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session

const val DEFAULT_INVALID_INPUT_MESSAGE = "Input is invalid!"

fun Session.myPromptInput(
message: String,
hint: String = "",
allowEmptyInput: Boolean = false,
invalidInputMessage: String = DEFAULT_INVALID_INPUT_MESSAGE,
inputValidator: (String) -> Boolean = { true },
onInputReady: suspend RunScope.() -> Unit,
): String {
    var lastUserInput = ""
    var hintText = hint
    var isInputValid by liveVarOf(true)
    section {
        drawInput(message, hintText, isInputValid, allowEmptyInput, invalidInputMessage, lastUserInput.isEmpty())
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
        onInputReady()
    }
    return lastUserInput
}

private fun MainRenderScope.drawInput(
message: String,
hint: String,
isInputValid: Boolean,
allowEmptyInput: Boolean,
invalidInputMessage: String,
lastInputEmpty: Boolean,
) {
    bold {
        green { text("? ") }
        text(message)
        if (isInputValid) {
            black(isBright = true) { textLine(if (allowEmptyInput) "  Empty input is allowed" else "") }
        } else {
            red { textLine(if (lastInputEmpty) "  Empty input is not allowed!" else "  $invalidInputMessage") }
        }
    }
    text("> ")
    input(Completions(hint), initialText = "")
}

fun Session.myPromptInputNumber(
message: String,
hint: String = "",
allowEmptyInput: Boolean = false,
invalidInputMessage: String = DEFAULT_INVALID_INPUT_MESSAGE,
inputValidator: (String) -> Boolean = { true },
onInputReady: suspend RunScope.() -> Unit,
): String {
    var lastUserInput = ""
    var hintText = hint
    var isInputValid by liveVarOf(true)
    section {
        drawInput(message, hintText, isInputValid, allowEmptyInput, invalidInputMessage, lastUserInput.isEmpty())
    }.runUntilSignal {
        onInputChanged {
        isInputValid = true
        input = input.filter { it.isDigit() }
        }
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
        onInputReady()
    }
    return lastUserInput
}

internal fun Session.myPromptConfirm(
message: String,
hint: String = "arrow keys to change selection",
onInputReady: suspend RunScope.() -> Unit,
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
                Keys.ENTER -> {
                result = choice
                signal()
                }
            }
        }
        onInputReady()
    }
    return result
}

private fun MainRenderScope.drawConfirm(
message: String,
hint: String,
choice: Boolean,
) {
    bold {
        green { text("? ") }
        text(message)
        black(isBright = true) { textLine("  $hint") }
    }
    if (choice) {
        text("> ")
        cyan { text("[Yes]") }
        textLine(" No ")
    } else {
        text(">  Yes ")
        cyan { textLine("[No]") }
    }
}

fun Session.myPromptList(
message: String,
choices: List<String>,
hint: String = "arrow keys to move, ENTER to select",
onInputReady: suspend RunScope.() -> Unit,
): String {
    var result = ""
    var selection by liveVarOf(0)
    section {
        drawList(message, hint, choices, selection)
    }.runUntilSignal {
        onKeyPressed {
            when (key) {
                Keys.UP ->
                if (selection > 0) {
                selection -= 1
                }
                Keys.DOWN ->
                if (selection < choices.size - 1) {
                selection += 1
                }
                Keys.ENTER -> {
                result = choices[selection]
                signal()
                }
            }
        }
        onInputReady()
    }
    return result
}

private fun MainRenderScope.drawList(
message: String,
hint: String,
choices: List<String>,
selection: Int,
) {
    bold {
    green { text("? ") }
    text(message)
    black(isBright = true) { textLine("  $hint") }
    }
    for (i in choices.indices) {
        if (i == selection) {
            cyan(isBright = true) { text(" ❯ ") }
            cyan { textLine(choices[i]) }
        } else {
            textLine("   ${choices[i]}")
        }
    }
}

internal fun Session.myPromptCheckbox(
message: String,
choices: List<String>,
hint: String = "SPACE to select, ENTER to confirm selection",
allowEmptyInput: Boolean = false,
onInputReady: suspend RunScope.() -> Unit,
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
                Keys.UP ->
                if (pos > 0) {
                pos -= 1
                }
                Keys.DOWN ->
                if (pos < choices.size - 1) {
                pos += 1
                }
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
        onInputReady()
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
selectedElems: LiveList<Boolean>,
) {
    bold {
        green { text("? ") }
        text(message)
        if (isInputValid) {
            black(isBright = true) { textLine(if (allowEmptyInput) "  $hint  Empty selection is allowed" else "  $hint") }
        } else {
            red { textLine("  Empty selection is not allowed!") }
        }
    }
    for (i in choices.indices) {
        cyan(isBright = true) { text(if (i == pos) " ❯ " else "   ") }
        if (selectedElems[i]) {
            green { text("◉ ") }
            cyan { textLine(choices[i]) }
        } else {
            textLine("◯ ${choices[i]}")
        }
    }
}

private fun getSelectedElems(
choices: List<String>,
selection: List<Boolean>,
): List<String> {
    val result = mutableListOf<String>()
    for (i in choices.indices) {
        if (selection[i]) result.add(choices[i])
    }
    return result
}

// public API

fun Session.myPromptInput(
message: String,
hint: String = "",
allowEmptyInput: Boolean = false,
invalidInputMessage: String = DEFAULT_INVALID_INPUT_MESSAGE,
inputValidator: (String) -> Boolean = { true },
): String {
    return myPromptInput(message, hint, allowEmptyInput, invalidInputMessage, inputValidator, onInputReady = {})
}

fun Session.myPromptInputNumber(
message: String,
hint: String = "",
allowEmptyInput: Boolean = false,
invalidInputMessage: String = DEFAULT_INVALID_INPUT_MESSAGE,
inputValidator: (String) -> Boolean = { true },
): String {
    return myPromptInputNumber(message, hint, allowEmptyInput, invalidInputMessage, inputValidator, onInputReady = {})
}

fun Session.myPromptConfirm(
message: String,
hint: String = "arrow keys to change selection",
): Boolean {
    return myPromptConfirm(message, hint, onInputReady = {})
}

fun Session.myPromptList(
message: String,
choices: List<String>,
hint: String = "arrow keys to move, ENTER to select",
): String {
    return myPromptList(message, choices, hint, onInputReady = {})
}

fun Session.myPromptCheckbox(
message: String,
choices: List<String>,
allowEmptyInput: Boolean = false,
hint: String = "SPACE to select, ENTER to confirm selection",
): List<String> {
    return myPromptCheckbox(message, choices, hint, allowEmptyInput, onInputReady = {})
}

fun MainRenderScope.drawFun(isInputEmpty: Boolean, sleepTimer: Long) {
    text("text before sleeping; empty input is $isInputEmpty")
    textLine("; input:")
    input()
    Thread.sleep(sleepTimer)
}

fun Session.testFun1(
//    message: String,
    callback: suspend RunScope.() -> Unit): String {
    var userInput = "-1"
    var emptyInput by liveVarOf(true)
    section {
//        drawInput(
//            message = message,
//            hint = "",
//            isInputValid = true,
//            allowEmptyInput = false,
//            invalidInputMessage = "invald",
//            "a"
//        )
        drawFun(emptyInput,0)
    }.runUntilSignal {
        onInputChanged { emptyInput = !emptyInput }
        onInputEntered {
            signal()
            userInput = input
        }
        callback()
    }
    return userInput
}

fun Session.testFun2(callback: suspend RunScope.() -> Unit): String {
    var userInput = "-1"
    var emptyInput by liveVarOf(true)
    section {
        drawFun(emptyInput, 0)
    }.runUntilSignal {
        onInputChanged { emptyInput = !emptyInput }
        onInputEntered {
            signal()
            userInput = input
        }
        callback()
    }
    return userInput
}
