package de.maibornwolff.codecharta.dialogProvider

import com.varabyte.kotter.foundation.collections.LiveList
import com.varabyte.kotter.foundation.input.Completions
import com.varabyte.kotter.foundation.input.input
import com.varabyte.kotter.foundation.text.black
import com.varabyte.kotter.foundation.text.bold
import com.varabyte.kotter.foundation.text.cyan
import com.varabyte.kotter.foundation.text.green
import com.varabyte.kotter.foundation.text.red
import com.varabyte.kotter.foundation.text.text
import com.varabyte.kotter.foundation.text.textLine
import com.varabyte.kotter.runtime.MainRenderScope

fun MainRenderScope.drawInput(
    message: String,
    isInputValid: Boolean,
    allowEmptyInput: Boolean,
    invalidInputMessage: String,
    lastInputEmpty: Boolean,
    vararg hint: String,
    displaySubInputText: Boolean = false,
    subInputText: String = ""
) {
    bold {
        this.green { this.text("? ") }
        this.text(message)
        if (isInputValid) {
            this.black(isBright = true) { this.textLine(if (allowEmptyInput) "  Empty input is allowed" else "") }
        } else {
            this.red { this.textLine(if (lastInputEmpty) "  Empty input is not allowed!" else "  $invalidInputMessage") }
        }
    }
    text("> ")
    input(Completions(*hint, ignoreCase = false), initialText = "")
    if (displaySubInputText) {
        text("\n")
        black(isBright = true) {
            text(subInputText)
        }
    }
}

fun MainRenderScope.drawConfirm(message: String, hint: String, choice: Boolean) {
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

fun MainRenderScope.drawList(message: String, hint: String, choices: List<String>, selection: Int) {
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

fun MainRenderScope.drawCheckbox(
    message: String,
    hint: String,
    isInputValid: Boolean,
    allowEmptyInput: Boolean,
    choices: List<String>,
    pos: Int,
    selectedElems: LiveList<Boolean>
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
