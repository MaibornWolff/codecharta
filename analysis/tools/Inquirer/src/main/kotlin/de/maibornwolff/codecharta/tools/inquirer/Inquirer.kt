package de.maibornwolff.codecharta.tools.inquirer

import com.varabyte.kotter.foundation.collections.liveListOf
import com.varabyte.kotter.foundation.input.Completions
import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.foundation.input.input
import com.varabyte.kotter.foundation.input.onInputChanged
import com.varabyte.kotter.foundation.input.onInputEntered
import com.varabyte.kotter.foundation.input.onKeyPressed
import com.varabyte.kotter.foundation.input.runUntilInputEntered
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

fun Session.myPromptInput(message: String, hint: String = ""): String { // todo, add flag to accept empty input or not
    var returnValue = ""
    section {
        bold { green { text("? ") }; textLine(message) }
        text("> "); input(Completions(hint), initialText = "")
    }.runUntilInputEntered {
        onInputEntered { returnValue = input; return@onInputEntered }
    }
    return returnValue
}

fun Session.myPromptInputNumber(
        message: String, hint: String = "",
        allowEmpty: Boolean = false,
        invalidInputMessage: String = "Input is invalid!"
): String {
    var returnValue = ""
    var showError = false
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
            } else {
                showError = true
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
        if (res) textLine(" [Yes] No ") else textLine("  Yes [No]")
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

fun Session.myPromptCheckbox(message: String, choices: List<String>, hint: String = ""): List<String> {
    var result = listOf<String>()
    var pos by liveVarOf(0)
    val selectedElems = liveListOf(MutableList(choices.size) { false })
    section {
        green { text("? ") }; text(message); black(isBright = true) { textLine("  $hint") }
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
            when (key) {
                Keys.UP -> if (pos> 0) { pos -= 1 }
                Keys.DOWN -> if (pos <choices.size - 1) { pos += 1 }
                Keys.SPACE -> selectedElems[pos] = !selectedElems[pos]
                Keys.ENTER -> { result = getSelectedElems(choices, selectedElems); signal() }
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
