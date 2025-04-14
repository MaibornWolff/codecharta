package de.maibornwolff.codecharta.dialogProvider

import com.varabyte.kotter.foundation.collections.LiveList
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
import java.nio.file.Paths

const val DEFAULT_INVALID_INPUT_MESSAGE = "Input is invalid!"

enum class InputType(val inputType: String) {
    FOLDER("folder"),
    FILE("file"),
    FOLDER_AND_FILE("folder or file")
}

fun Session.promptInput(
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

fun Session.promptInputNumber(
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

fun Session.promptConfirm(
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

fun Session.promptList(
    message: String,
    choices: List<String>,
    hint: String = "arrow keys to move, ENTER to select",
    onInputReady: suspend RunScope.() -> Unit
): String {
    var result = ""
    var selectionPosition by liveVarOf(0)
    section {
        drawList(message, hint, choices, selectionPosition)
    }.runUntilSignal {
        onKeyPressed {
            when (key) {
                Keys.UP -> selectionPosition = moveUp(selectionPosition)
                Keys.DOWN ->
                    selectionPosition = moveDown(selectionPosition, choices.size)
                Keys.ENTER -> {
                    result = choices[selectionPosition]
                    signal()
                }
            }
        }
        onInputReady()
    }
    return result
}

fun Session.promptCheckbox(
    message: String,
    choices: List<String>,
    hint: String = "SPACE to select, ENTER to confirm selection",
    allowEmptyInput: Boolean = false,
    onInputReady: suspend RunScope.() -> Unit
): List<String> {
    var result = listOf<String>()
    var currentPosition by liveVarOf(0)
    val selectedChoices = liveListOf(MutableList(choices.size) { false })
    var isInputValid by liveVarOf(true)
    section {
        drawCheckbox(message, hint, isInputValid, allowEmptyInput, choices, currentPosition, selectedChoices)
    }.runUntilSignal {
        onKeyPressed {
            isInputValid = true
            when (key) {
                Keys.UP ->
                    currentPosition = moveUp(currentPosition)
                Keys.DOWN ->
                    currentPosition = moveDown(currentPosition, choices.size)
                Keys.SPACE -> selectOrUnselectChoice(selectedChoices, currentPosition)
                Keys.ENTER -> {
                    result = getSelectedChoices(choices, selectedChoices)
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

private fun selectOrUnselectChoice(selectedChoices: LiveList<Boolean>, position: Int) {
    selectedChoices[position] = !selectedChoices[position]
}

private fun moveDown(position: Int, numberOfChoices: Int): Int {
    var positionCopy = position
    if (positionCopy < numberOfChoices - 1) {
        positionCopy += 1
    }
    return positionCopy
}

private fun moveUp(position: Int): Int {
    var positionCopy = position
    if (positionCopy > 0) {
        positionCopy -= 1
    }
    return positionCopy
}

private fun getSelectedChoices(choices: List<String>, selection: List<Boolean>): List<String> {
    val result = mutableListOf<String>()
    for (i in choices.indices) {
        if (selection[i]) result.add(choices[i])
    }
    return result
}

fun Session.promptDefaultFileFolderInput(
    inputType: InputType,
    fileExtensionList: List<FileExtension>,
    multiple: Boolean = false,
    onInputReady: suspend RunScope.() -> Unit
): String {
    val messageFileExtension = "[${fileExtensionList.joinToString(", ") { fileExtension -> fileExtension.extension }}]"

    val pluralSuffix: String
    val hintText: String
    val messageExtension: String
    if (multiple) {
        pluralSuffix = "(s)"
        val sampleFileExtension = if (fileExtensionList.isEmpty()) "" else fileExtensionList.first().extension
        hintText = "input1$sampleFileExtension, input2$sampleFileExtension, ..."
        messageExtension = " Enter multiple files comma separated."
    } else {
        pluralSuffix = ""
        hintText = Paths.get("").toAbsolutePath().toString()
        messageExtension = ""
    }

    val inputMessage: String =
        if (fileExtensionList.isEmpty()) {
            when (inputType) {
                InputType.FOLDER -> {
                    "folder$pluralSuffix"
                }
                InputType.FILE -> {
                    "file$pluralSuffix"
                }
                else -> {
                    "folder$pluralSuffix or file$pluralSuffix"
                }
            }
        } else {
            when (inputType) {
                InputType.FOLDER -> {
                    "folder$pluralSuffix of $messageFileExtension files"
                }
                InputType.FILE -> {
                    "$messageFileExtension file$pluralSuffix"
                }
                else -> {
                    "folder$pluralSuffix or $messageFileExtension file$pluralSuffix"
                }
            }
        }

    return promptInput(
        message = "What ${if (multiple) "are" else "is"} the input $inputMessage.$messageExtension",
        hint = hintText,
        allowEmptyInput = false,
        invalidInputMessage = "Please input a valid ${inputType.inputType}",
        inputValidator = InputValidator.isFileOrFolderValid(
            inputType,
            fileExtensionList,
            multiple = multiple
        ),
        onInputReady = onInputReady
    )
}
