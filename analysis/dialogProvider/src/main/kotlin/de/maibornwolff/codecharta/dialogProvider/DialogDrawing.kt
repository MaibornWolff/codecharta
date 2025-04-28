package de.maibornwolff.codecharta.dialogProvider

import com.varabyte.kotter.foundation.collections.LiveList
import com.varabyte.kotter.foundation.input.Completions
import com.varabyte.kotter.foundation.input.InputCompleter
import com.varabyte.kotter.foundation.input.input
import com.varabyte.kotter.foundation.text.black
import com.varabyte.kotter.foundation.text.bold
import com.varabyte.kotter.foundation.text.cyan
import com.varabyte.kotter.foundation.text.green
import com.varabyte.kotter.foundation.text.red
import com.varabyte.kotter.foundation.text.text
import com.varabyte.kotter.foundation.text.textLine
import com.varabyte.kotter.runtime.MainRenderScope
import java.nio.file.Path
import java.nio.file.Paths
import kotlin.io.path.isDirectory
import kotlin.io.path.isRegularFile
import kotlin.io.path.listDirectoryEntries

fun MainRenderScope.drawInput(
    message: String,
    hint: String,
    isInputValid: Boolean,
    allowEmptyInput: Boolean,
    invalidInputMessage: String,
    lastInputEmpty: Boolean,
    inputCompleter: InputCompleter
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
    input(inputCompleter, initialText = "")
}

fun MainRenderScope.drawInputWithInfo(
    message: String,
    hint: String,
    isInputValid: Boolean,
    allowEmptyInput: Boolean,
    invalidInputMessage: String,
    lastInputEmpty: Boolean,
    lastInput: String,
    allowedExtension: String = ".cc.json"
) {
    var inputCompleter = Completions("")
    bold {
        green { text("? ") }
        text(message)
        if (isInputValid) {
            black(isBright = true) { textLine(if (allowEmptyInput) "  Empty input is allowed" else "") }
        } else {
            red { textLine(if (lastInputEmpty) "  Empty input is not allowed!" else "  $invalidInputMessage") }
        }
    }


    // Get input
    // Check if input is directory or file with allowed extension
    // if dir -> listDirectoryEntries
    // else use last valid result and filter by

    val currentPosition = try {
        Paths.get(lastInput)
    } catch (e: Exception) {
        Paths.get(lastInput.substringBeforeLast("/"))
    }
    textLine(currentPosition.toString())
    if(currentPosition.isDirectory()) {
        lastGood = currentPosition.listDirectoryEntries()
        inputCompleter = Completions(*lastGood.map { it.toString() }.toTypedArray())
    }
    val floatingInput = lastInput.substringAfterLast("/")
    val possibleMatches = lastGood.filter { it.startsWith(floatingInput) && ( it.isDirectory() || ( it.isRegularFile()) && it.endsWith(allowedExtension) ) }
//    val filter = if (lastInput.isEmpty() ) "*" else lastInput + "*"
//    val currentFolders = cwd.listDirectoryEntries(filter).filter { it.isDirectory() }
//    if (currentFolders.size == 1) {
//        inputCompleter = Completions(currentFolders.first().toString()+ "/")
//    }


    val someResults = getSomeEntries(possibleMatches)

    text("> ")
    input(inputCompleter, initialText = "")
    textLine("")

    black(isBright = true) {
        textLine(someResults)
    }

}

fun getSomeEntries(paths: List<Path>, charLimit : Int = 120): String {
    var usedChars = 0
    var secondLine = false
    var availableFolders = ""
    paths.forEach {
        val pathLength = it.toString().length
        if (usedChars + pathLength > charLimit) {
            if (secondLine) {
                return availableFolders
            } else {
                secondLine = true
                if (pathLength > charLimit) {
                    return availableFolders
                } else {
                    availableFolders += "\n" + "${it}/ "
                    usedChars = pathLength
                }
            }
        } else {
            availableFolders += "${it}/ "
            usedChars += pathLength
        }
    }
    return availableFolders
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
