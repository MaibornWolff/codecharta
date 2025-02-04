package de.maibornwolff.codecharta.tools.ccsh.parser

import com.varabyte.kotter.foundation.session
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.tools.inquirer.InputType
import de.maibornwolff.codecharta.tools.inquirer.myPromptCheckbox
import de.maibornwolff.codecharta.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptList
import de.maibornwolff.codecharta.tools.inquirer.util.InputValidator
import java.nio.file.Paths

class InteractiveDialog {
    companion object {
        internal fun Session.askParserToExecute(parserOptions: List<String>, parserCallback: suspend RunScope.() -> Unit = {}): String {
            return myPromptList(
                message = "Which parser do you want to execute?",
                choices = parserOptions,
                onInputReady = parserCallback
            )
        }

        fun callAskParserToExecute(parserOptions: List<String>): String {
            var selectedParser = ""
            session {
                selectedParser = askParserToExecute(parserOptions)
            }
            return selectedParser
        }

        internal fun Session.askForPath(pathCallback: suspend RunScope.() -> Unit = {}): String {
            println("You can provide a directory path / file path / sonar url.")
            return myPromptInput(
                message = "Which path should be scanned?",
                hint = Paths.get("").toAbsolutePath().toString(),
                allowEmptyInput = false,
                onInputReady = pathCallback
            )
        }

        fun callAskForPath(): String {
            var inputFilePath = ""
            println("You can provide a directory path / file path / sonar url.")
            session {
                inputFilePath = askForPath()
            }
            return inputFilePath
        }

        internal fun Session.askApplicableParser(
            applicableParsers: List<String>,
            applicableCallback: suspend RunScope.() -> Unit = {
            }
        ): List<String> {
            return myPromptCheckbox(
                message = "Choose from this list of applicable parsers. You can select individual parsers by pressing spacebar.",
                choices = applicableParsers,
                allowEmptyInput = true,
                onInputReady = applicableCallback
            )
        }

        fun callAskApplicableParser(applicableParsers: List<String>): List<String> {
            var selectedParsers: List<String> = listOf()
            session {
                selectedParsers = askApplicableParser(applicableParsers)
            }
            return selectedParsers
        }

        internal fun Session.askRunParsers(runCallback: suspend RunScope.() -> Unit = {}): Boolean {
            return myPromptConfirm(
                message = "Do you want to run all configured parsers now?",
                onInputReady = runCallback
            )
        }

        fun callAskRunParsers(): Boolean {
            var shouldRunConfiguredParsers = true
            session {
                shouldRunConfiguredParsers = askRunParsers()
            }
            return shouldRunConfiguredParsers
        }

        internal fun Session.askForMerge(mergeCallback: suspend RunScope.() -> Unit = {}): Boolean {
            return myPromptConfirm(
                message = "Do you want to merge all generated files into one result now?",
                onInputReady = mergeCallback
            )
        }

        fun callAskForMerge(): Boolean {
            var shouldMerge = false
            session {
                shouldMerge = askForMerge()
            }
            return shouldMerge
        }

        internal fun Session.askJsonPath(jsonCallback: suspend RunScope.() -> Unit = {}): String {
            println(
                "If you did not output all cc.json files into the same folder, " +
                    "you need to manually move them there before trying to merge."
            )
            return myPromptInput(
                message = "What is the folder path containing all cc.json files?",
                hint = Paths.get("").toAbsolutePath().toString(),
                inputValidator = InputValidator.isFileOrFolderValid(InputType.FOLDER, listOf()),
                onInputReady = jsonCallback
            )
        }

        fun callAskJsonPath(): String {
            var ccJsonFilePath = ""
            session {
                ccJsonFilePath = askJsonPath()
            }
            return ccJsonFilePath
        }
    }
}
