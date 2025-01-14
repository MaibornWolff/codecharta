package de.maibornwolff.codecharta.tools.inquirer

import com.varabyte.kotter.foundation.collections.liveListOf
import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.foundation.input.onInputChanged
import com.varabyte.kotter.foundation.input.onInputEntered
import com.varabyte.kotter.foundation.input.onKeyPressed
import com.varabyte.kotter.foundation.liveVarOf
import com.varabyte.kotter.foundation.runUntilSignal
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.tools.inquirer.util.InputValidator
import java.nio.file.Paths

const val DEFAULT_INVALID_INPUT_MESSAGE = "Input is invalid!"

enum class InputType(val inputType: String) {
    FOLDER("folder"),
    FILE("file"),
    FOLDER_AND_FILE("folder or file")
}

fun Session.myPromptInput(
    message: String,
    hint: String = "",
    allowEmptyInput: Boolean = false,
    invalidInputMessage: String = DEFAULT_INVALID_INPUT_MESSAGE,
    inputValidator: (String) -> Boolean = { true },
    onInputReady: suspend RunScope.() -> Unit
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

fun Session.myPromptInputNumber(
    message: String,
    hint: String = "",
    allowEmptyInput: Boolean = false,
    invalidInputMessage: String = DEFAULT_INVALID_INPUT_MESSAGE,
    inputValidator: (String) -> Boolean = { true },
    onInputReady: suspend RunScope.() -> Unit
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

fun Session.myPromptConfirm(
    message: String,
    hint: String = "arrow keys to change selection",
    onInputReady: suspend RunScope.() -> Unit
): Boolean {
    var result = true
    var choice by liveVarOf(true)
    section {
        drawConfirm(message, hint, choice)
    }.runUntilSignal {
        onKeyPressed {
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

fun Session.myPromptList(
    message: String,
    choices: List<String>,
    hint: String = "arrow keys to move, ENTER to select",
    onInputReady: suspend RunScope.() -> Unit
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

fun Session.myPromptCheckbox(
    message: String,
    choices: List<String>,
    hint: String = "SPACE to select, ENTER to confirm selection",
    allowEmptyInput: Boolean = false,
    onInputReady: suspend RunScope.() -> Unit
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

private fun getSelectedElems(choices: List<String>, selection: List<Boolean>): List<String> {
    val result = mutableListOf<String>()
    for (i in choices.indices) {
        if (selection[i]) result.add(choices[i])
    }
    return result
}

fun Session.myPromptDefaultFileFolderInput(
    allowEmptyInput: Boolean,
    inputType: InputType,
    fileExtensionList: List<FileExtension>,
    onInputReady: suspend RunScope.() -> Unit
): String {
    val messageFileExtension = "[${fileExtensionList.joinToString(", ")}]"
    val inputMessage: String =
        if (fileExtensionList.isEmpty()) {
            when (inputType) {
                InputType.FOLDER -> {
                    "folder"
                }
                InputType.FILE -> {
                    "file"
                }
                else -> {
                    "folder or file"
                }
            }
        } else {
            when (inputType) {
                InputType.FOLDER -> {
                    "folder of $messageFileExtension files"
                }
                InputType.FILE -> {
                    "$messageFileExtension file"
                }
                else -> {
                    "folder or $messageFileExtension file"
                }
            }
        }
    val currentWorkingDirectory = Paths.get("").toAbsolutePath().toString()

    return myPromptInput(
        message = "What is the input $inputMessage",
        hint = currentWorkingDirectory,
        allowEmptyInput = allowEmptyInput,
        invalidInputMessage = "Please input a valid ${inputType.inputType}",
        inputValidator = InputValidator.isFileOrFolderValid(inputType, fileExtensionList),
        onInputReady = onInputReady
    )
}
